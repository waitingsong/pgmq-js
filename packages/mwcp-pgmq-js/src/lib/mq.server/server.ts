/* eslint-disable no-await-in-loop */
import assert from 'node:assert'
import { EventEmitter } from 'node:events'

import { type ILogger, Inject, Logger, Singleton } from '@midwayjs/core'
import type { ReadWithPollOptions } from '@waiting/pgmq-js'
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
  // sourceName -> Map<queueName, Set<ConsumerCallback>>
  protected readonly consumerList = new Map<SourceName, Map<QueueName, Set<ConsumerCallback>>>()
  protected readonly listenerList = new Map<SourceName, Map<QueueName, Set<NodeJS.Timeout>>>()

  // #region listener methods

  async registerListener(
    listenerOptions: Partial<PgmqListenerOptions>,
    listenerCallback: ConsumerCallback,
  ): Promise<void> {

    this.closed = false
    const { queue: queueName } = listenerOptions
    assert(queueName, 'queueName is required')
    const { sourceName } = listenerOptions
    assert(sourceName, 'sourceName is required')

    if (typeof queueName === 'string') {
      const opts: PgmqListenerOptionsInner = {
        ...initConsumerOptions,
        ...listenerOptions,
        sourceName,
        queue: queueName,
      }
      const intv = opts.maxPollSeconds * 1000 + this.intvDelay
      await this.createListener(opts, intv)
      this.updateSourceQueueSet(sourceName, queueName, listenerCallback)
    }
    else {
      for (const name of queueName) {
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

  unregisterListener(sourceName: SourceName, queueName: QueueName): void {
    this.stopListener(sourceName, queueName)
    this.removeQueueNameFromSource(sourceName, queueName)
  }

  close(): void {
    this.closed = true
    this.listenerList.forEach((queueMap, sourceName) => {
      queueMap.forEach((_, queueName) => {
        this.unregisterListener(sourceName, queueName)
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

    const { queue: queueName } = listenerOptions
    const msgIds = msgs.map(msg => msg.msgId)
    if (msgIds.length) {
      await pgmq.msg.archiveBatch(queueName, msgIds)
    }
  }

  protected async deleteMsgs(
    pgmq: Pgmq,
    listenerOptions: PgmqListenerOptionsInner,
    msgs: MessageDto[] | Message[],
  ): Promise<void> {

    const { queue: queueName } = listenerOptions
    const msgIds = msgs.map(msg => msg.msgId)
    if (msgIds.length) {
      await pgmq.msg.deleteBatch(queueName, msgIds)
    }
  }

  protected async processMsgs(
    sourceName: SourceName,
    queueName: QueueName,
    msgs: MessageDto[],
  ): Promise<void> {

    const callbackSet = this.getListenerCallbackSet(sourceName, queueName)
    if (! callbackSet?.size) { return }

    for (const msg of msgs) {
      const cbArr = Array.from(callbackSet)
      const pms: Promise<void>[] = cbArr.map((cb) => {
        return this.executeListenerCallback(queueName, msg, cb)
          /* c8 ignore next 3 */
          .catch((err) => {
            this.logger.error(err)
          })
      })
      // eslint-disable-next-line no-await-in-loop
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
      this.logger.info(`pgmqServer closed, return empty array, queueName: ${opts.queue}`)
      return []
    }
    await this.consumeAction(mq, listenerOptions, msgs, 'before')

    const ret = msgs.map(convertToDto<Message, MessageDto>)
    // console.info('msg.readWithPoll: ' + queueName, ret)
    return ret
  }

  // #region listenerList methods

  protected async createListener(
    listenerOptions: PgmqListenerOptionsInner,
    interval: number,
  ): Promise<void> {

    const { sourceName, queue: queueName } = listenerOptions
    const mq = this.mqManager.getDataSource(sourceName)
    assert(mq, `sourceName not found: ${sourceName}`)

    const queueExists = await mq.queue.hasQueue(queueName)
    if (! queueExists) {
      if (listenerOptions.autoCreateQueue) {
        await mq.queue.create(queueName)
      }
      else {
        throw new Error(`queueName not found: ${queueName} in sourceName: ${sourceName}`)
      }
    }

    const { queueConnectionNumber } = listenerOptions
    assert(queueConnectionNumber > 0, 'queueConnectionNumber must be greater than 0')
    assert(queueConnectionNumber < 100, 'queueConnectionNumber must be less than 100')

    for (let i = 0; i < queueConnectionNumber; i += 1) {
      const rndDelayMs = Math.floor(Math.random() * 1000)
      await sleep(rndDelayMs)

      const intv = setInterval((clz, mq1, opts) => {
        clz.pullAndConsume(mq1, opts)
      }, interval, this, mq, listenerOptions)
      this.setQueryInterval(sourceName, queueName, intv)
    }
  }

  protected pullAndConsume(mq: Pgmq, listenerOptions: PgmqListenerOptionsInner): void {
    if (this.closed) { return }

    const { sourceName, queue: queueName } = listenerOptions
    void this.readMsgsFromQueue(mq, listenerOptions)
      .then(async (msgs) => {
        if (! msgs.length) { return }
        /* c8 ignore next */
        if (this.closed) { return }

        await this.processMsgs(sourceName, queueName, msgs)
        await this.consumeAction(mq, listenerOptions, msgs, 'after')
      })
      /* c8 ignore next 3 */
      .catch((err) => {
        this.logger.error(err)
      })
  }

  protected async executeListenerCallback(
    queueName: QueueName,
    msg: MessageDto,
    listenerCallback: ConsumerCallback,
  ): Promise<void> {

    const consumerMsg: ConsumerMessageDto = {
      ...msg,
      queueName,
    }
    await listenerCallback(consumerMsg)
  }


  getQueryIntervals(sourceName: SourceName, queueName: QueueName): NodeJS.Timeout[] {
    const queueMap = this.listenerList.get(sourceName)
    if (! queueMap?.size) {
      return []
    }
    const intvSet = queueMap.get(queueName)
    return Array.from(intvSet ?? [])
  }

  protected setQueryInterval(sourceName: string, queueName: QueueName, interval: NodeJS.Timeout): void {
    let queueMap = this.listenerList.get(sourceName)
    if (! queueMap?.size) {
      queueMap = new Map()
      queueMap.set(queueName, new Set())
      this.listenerList.set(sourceName, queueMap)
    }
    let intvSet = queueMap.get(queueName)
    if (! intvSet?.size) {
      intvSet = new Set()
      queueMap.set(queueName, intvSet)
    }
    intvSet.add(interval)
  }

  protected stopListener(sourceName: SourceName, queueName: QueueName): void {
    const intvArr = this.getQueryIntervals(sourceName, queueName)
    intvArr.forEach((intv) => {
      clearInterval(intv)
    })
  }

  // #region consumerList methods

  protected getListenerCallbackSet(sourceName: string, queueName: string): Set<ConsumerCallback> | undefined {
    const queueMap = this.consumerList.get(sourceName)
    if (! queueMap) { return }
    return queueMap.get(queueName)
  }

  protected updateSourceQueueSet(
    sourceName: string,
    queueName: string,
    listenerCallback: ConsumerCallback,
  ): void {

    let queueMap = this.consumerList.get(sourceName)
    if (! queueMap?.size) {
      queueMap = new Map()
      this.consumerList.set(sourceName, queueMap)
    }
    let cbSet = queueMap.get(queueName)
    if (! cbSet?.size) {
      cbSet = new Set()
      queueMap.set(queueName, cbSet)
    }
    cbSet.add(listenerCallback)
  }


  // #region clean

  protected removeQueueNameFromSource(sourceName: string, queueName: string): void {
    const queueMap = this.consumerList.get(sourceName)
    queueMap?.delete(queueName)
  }


}


interface PgmqListenerOptionsInner extends PgmqListenerOptions {
  queue: QueueName
}
type SourceName = string
type QueueName = string

