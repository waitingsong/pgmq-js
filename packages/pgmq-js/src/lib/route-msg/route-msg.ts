import assert from 'node:assert'

import type { Knex } from '../knex.types.js'
import type { MsgContent, SendOptions } from '../msg-manager/index.msg.js'
import type { MsgManager } from '../msg-manager/msg-manager.js'
import type { QueueId } from '../queue-meta-manager/index.queue-meta.js'
import type { QueueMetaManager } from '../queue-meta-manager/queue-meta-manager.js'
import type { Router } from '../router/router.js'
import type { RouteDto } from '../router/router.types.js'

import { type SendRouteMsgOptions, type SendRouteMsgResultItem, RouteMsgQueueNotExistAction } from './route-msg.types.js'


export class RouteMsg {

  sendConcurrentNumber = 5

  constructor(
    protected readonly dbh: Knex,
    protected readonly msgManager: MsgManager,
    protected readonly queueMeta: QueueMetaManager,
    protected readonly router: Router,
  ) { }

  /**
   * Send route message
   * @description Send a message to queues bind to the route
   */
  async send<T extends MsgContent>(options: SendRouteMsgOptions<T>): Promise<SendRouteMsgResultItem[]> {
    const { routeName } = options
    const trx = options.trx ?? await this.dbh.transaction()
    assert(trx, 'trx is null')

    const route = await this.router.getOne({ routeName, trx })
    assert(route, `Route ${routeName} not exist`)
    assert(route.queueIds.length > 0, `Route ${routeName} not bind to any queue`)

    const ret: SendRouteMsgResultItem[] = []
    const limit = this.sendConcurrentNumber > 0 ? this.sendConcurrentNumber : 5
    for (let i = 0; i < route.queueIds.length; i += limit) {
      const batch: QueueId[] = route.queueIds.slice(i, i + limit)
      const pms: SendRouteMsgResultItem[][] = await Promise.all(batch.map(queueId => this._send(route, queueId, { ...options, trx })))
      pms.forEach((items) => {
        for (const item of items) {
          ret.push(item)
        }
      })
    }

    if (! options.trx) {
      await trx.commit()
    }
    return ret
  }

  async _send<T extends MsgContent>(
    route: RouteDto,
    queueId: QueueId,
    options: SendRouteMsgOptions<T>,
  ): Promise<SendRouteMsgResultItem[]> {

    const { trx, routeName } = options
    assert(trx, 'trx is null')
    const onQueueNotExist = options.onQueueNotExist ?? RouteMsgQueueNotExistAction.Ignore
    const ret: SendRouteMsgResultItem[] = []

    const queue = await this.queueMeta.getById({ queueId, trx })
    if (! queue) {
      if (onQueueNotExist === RouteMsgQueueNotExistAction.Throw) {
        await trx.rollback()
        throw new Error(`Queue ${queueId} not exist while sending route message ${routeName}`)
      }
      return ret
    }

    const msgOpts: SendOptions<T> = {
      queue: queue.queue,
      msg: options.msg,
      delay: options.delay ?? 0,
      trx,
    }
    const [msgId] = await this.msgManager.send(msgOpts)
    if (msgId) {
      const item: SendRouteMsgResultItem = {
        msgId,
        routeId: route.routeId,
        routeName,
        queueId,
        queue: queue.queue,
      }
      ret.push(item)
    }

    return ret
  }
}

