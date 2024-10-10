
import assert from 'node:assert'
import { EventEmitter } from 'node:events'

import { type ILogger, Inject, Logger, Singleton } from '@midwayjs/core'
import type { DeleteBatchOptions, ReadWithPollOptions } from '@waiting/pgmq-js'
import { sleep } from '@waiting/shared-core'

import { Message, MessageDto, Pgmq } from '##/index.js'
import type { ConsumerCallback, ConsumerMessageDto } from '##/lib/mq.consumer/index.consumer.js'
import type { PgmqListenerOptions } from '##/lib/mq.listener/index.listener.js'
import { PgmqManager } from '##/lib/pgmq-manager.js'

import { convertToDto } from '../helper.js'
import { initConsumerOptions } from '../mq.consumer/consumer.config.js'


@Singleton()
export class PgmqServer extends EventEmitter {

  @Logger() protected readonly logger: ILogger
  @Inject() protected readonly mqManager: PgmqManager

  closed = false
  intvDelay = 100 // ms
  protected readonly consumerList = new Map<SourceName, Map<QueueName, Set<ConsumerCallback>>>()
  protected readonly listenerList = new Map<SourceName, Map<QueueName, Set<NodeJS.Timeout>>>()

  // #region listener methods

  async registerListener(
    listenerOptions: Partial<PgmqListenerOptions>,
    listenerCallback: ConsumerCallback,
  ): Promise<void> {

    this.closed = false
    const { queue } = listenerOptions
    assert(queue, 'queue is required')
    const { sourceName } = listenerOptions
    assert(sourceName, 'sourceName is required')

    if (typeof queue === 'string') {
      const opts: PgmqListenerOptionsInner = {
        ...initConsumerOptions,
        ...listenerOptions,
        sourceName,
        queue: queue,
      }
      const intv = opts.maxPollSeconds * 1000 + this.intvDelay
      await this.createListener(opts, intv)
      this.updateSourceQueueSet(sourceName, queue, listenerCallback)
    }
    else {
      for (const name of queue) {
        const opts: PgmqListenerOptionsInner = {
          ...initConsumerOptions,
          ...listenerOptions,
          sourceName,
          queue: name,
        }
        const intv = opts.maxPollSeconds * 1000 + this.intvDelay
        await this.createListener(opts, intv)
        this.updateSourceQueueSet(sourceName, name, listenerCallback)
      }
    }
  }

  unregisterListener(sourceName: SourceName, queue: QueueName): void {
    this.stopListener(sourceName, queue)
    this.removeQueueNameFromSource(sourceName, queue)
  }

  close(): void {
    this.closed = true
    this.listenerList.forEach((queueMap, sourceName) => {
      queueMap.forEach((_, queue) => {
        this.unregisterListener(sourceName, queue)
      })
    })
    this.consumerList.clear()
    this.listenerList.clear()
  }

  protected async consumeAction(
    pgmq: Pgmq,
    listenerOptions: PgmqListenerOptionsInner,
    msgs: MessageDto[] | Message[],
    at: 'before' | 'after',
  ): Promise<void> {

    const { consumeAction, consumeActionAt } = listenerOptions
    if (at !== consumeActionAt) { return }

    if (consumeAction === 'delete') {
      await this.deleteMsgs(pgmq, listenerOptions, msgs)
    }
    else if (consumeAction === 'archive') {
      await this.archiveMsgs(pgmq, listenerOptions, msgs)
    }
  }

  // #region message

  protected async archiveMsgs(
    pgmq: Pgmq,
    listenerOptions: PgmqListenerOptionsInner,
    msgs: MessageDto[] | Message[],
  ): Promise<void> {

    const { queue } = listenerOptions
    const msgIds = msgs.map(msg => msg.msgId)
    if (msgIds.length) {
      const opts: DeleteBatchOptions = {
        queue,
        msgIds,
      }
      await pgmq.msg.archiveBatch(opts)
    }
  }

  protected async deleteMsgs(
    pgmq: Pgmq,
    listenerOptions: PgmqListenerOptionsInner,
    msgs: MessageDto[] | Message[],
  ): Promise<void> {

    const { queue } = listenerOptions
    const msgIds = msgs.map(msg => msg.msgId)
    if (msgIds.length) {
      const opts: DeleteBatchOptions = {
        queue,
        msgIds,
      }
      await pgmq.msg.deleteBatch(opts)
    }
  }

  protected async processMsgs(
    sourceName: SourceName,
    queue: QueueName,
    msgs: MessageDto[],
  ): Promise<void> {

    const callbackSet = this.getListenerCallbackSet(sourceName, queue)
    if (! callbackSet?.size) { return }

    for (const msg of msgs) {
      const cbArr = Array.from(callbackSet)
      const pms: Promise<void>[] = cbArr.map((cb) => {
        return this.executeListenerCallback(queue, msg, cb)
          /* c8 ignore next 3 */
          .catch((err) => {
            this.logger.error(err)
          })
      })

      await Promise.all(pms)
    }
  }

  protected async readMsgsFromQueue(
    mq: Pgmq,
    listenerOptions: PgmqListenerOptionsInner,
  ): Promise<MessageDto[]> {

    const { vt, maxPollSeconds } = listenerOptions
    const vt2 = vt + maxPollSeconds
    const opts: ReadWithPollOptions = {
      ...listenerOptions,
      vt: vt2,
    }
    const msgs = await mq.msg.readWithPoll(opts)
    if (this.closed) {
      this.logger.info(`pgmqServer closed, return empty array, queue: ${opts.queue}`)
      return []
    }
    await this.consumeAction(mq, listenerOptions, msgs, 'before')

    const ret = msgs.map(convertToDto<Message, MessageDto>)
    return ret
  }

  // #region listenerList methods

  protected async createListener(
    listenerOptions: PgmqListenerOptionsInner,
    interval: number,
  ): Promise<void> {

    const { sourceName, queue } = listenerOptions
    const mq = this.mqManager.getDataSource(sourceName)
    assert(mq, `sourceName not found: ${sourceName}`)

    await this.initQueue(sourceName, mq, queue, listenerOptions.autoCreateQueue)

    const { queueConnectionNumber } = listenerOptions
    assert(queueConnectionNumber > 0, 'queueConnectionNumber must be greater than 0')
    assert(queueConnectionNumber < 100, 'queueConnectionNumber must be less than 100')

    for (let i = 0; i < queueConnectionNumber; i += 1) {
      const rndDelayMs = Math.floor(Math.random() * 1000)
      await sleep(rndDelayMs)

      const intv = setInterval((clz, mq1, opts) => {
        clz.pullAndConsume(mq1, opts)
      }, interval, this, mq, listenerOptions)
      this.setQueryInterval(sourceName, queue, intv)
    }
  }

  /**
   * Check if queue exists,
   * and create it if not exists when autoCreateQueue is true,
   * otherwise throw error
   */
  protected async initQueue(
    sourceName: string,
    mq: Pgmq,
    queue: string,
    autoCreateQueue: boolean,
  ): Promise<void> {

    const queueExists = await mq.queue.hasQueue({ queue })
    if (queueExists) { return }

    if (autoCreateQueue) {
      await mq.queue.create({ queue })
    }
    else {
      throw new Error(`queue not found: ${queue} in sourceName: ${sourceName}`)
    }
  }

  protected pullAndConsume(mq: Pgmq, listenerOptions: PgmqListenerOptionsInner): void {
    if (this.closed) { return }

    const { sourceName, queue } = listenerOptions
    void this.readMsgsFromQueue(mq, listenerOptions)
      .then(async (msgs) => {
        if (! msgs.length) { return }
        /* c8 ignore next */
        if (this.closed) { return }

        await this.processMsgs(sourceName, queue, msgs)
        await this.consumeAction(mq, listenerOptions, msgs, 'after')
      })
      /* c8 ignore next 3 */
      .catch((err) => {
        this.logger.error(err)
      })
  }

  protected async executeListenerCallback(
    queue: QueueName,
    msg: MessageDto,
    listenerCallback: ConsumerCallback,
  ): Promise<void> {

    const consumerMsg: ConsumerMessageDto = {
      ...msg,
      queue,
    }
    await listenerCallback(consumerMsg)
  }


  getQueryIntervals(sourceName: SourceName, queue: QueueName): NodeJS.Timeout[] {
    const queueMap = this.listenerList.get(sourceName)
    if (! queueMap?.size) {
      return []
    }
    const intvSet = queueMap.get(queue)
    return Array.from(intvSet ?? [])
  }

  protected setQueryInterval(sourceName: string, queue: QueueName, interval: NodeJS.Timeout): void {
    let queueMap = this.listenerList.get(sourceName)
    if (! queueMap?.size) {
      queueMap = new Map()
      queueMap.set(queue, new Set())
      this.listenerList.set(sourceName, queueMap)
    }
    let intvSet = queueMap.get(queue)
    if (! intvSet?.size) {
      intvSet = new Set()
      queueMap.set(queue, intvSet)
    }
    intvSet.add(interval)
  }

  protected stopListener(sourceName: SourceName, queue: QueueName): void {
    const intvArr = this.getQueryIntervals(sourceName, queue)
    intvArr.forEach((intv) => {
      clearInterval(intv)
    })
  }

  // #region consumerList methods

  protected getListenerCallbackSet(sourceName: string, queue: string): Set<ConsumerCallback> | undefined {
    const queueMap = this.consumerList.get(sourceName)
    if (! queueMap) { return }
    return queueMap.get(queue)
  }

  protected updateSourceQueueSet(
    sourceName: string,
    queue: string,
    listenerCallback: ConsumerCallback,
  ): void {

    let queueMap = this.consumerList.get(sourceName)
    if (! queueMap?.size) {
      queueMap = new Map()
      this.consumerList.set(sourceName, queueMap)
    }
    let cbSet = queueMap.get(queue)
    if (! cbSet?.size) {
      cbSet = new Set()
      queueMap.set(queue, cbSet)
    }
    cbSet.add(listenerCallback)
  }


  // #region clean

  protected removeQueueNameFromSource(sourceName: string, queue: string): void {
    const queueMap = this.consumerList.get(sourceName)
    queueMap?.delete(queue)
  }


}


interface PgmqListenerOptionsInner extends PgmqListenerOptions {
  queue: QueueName
}
type SourceName = string
type QueueName = string

