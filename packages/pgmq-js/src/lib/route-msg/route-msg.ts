import assert from 'node:assert'

import type { Knex } from '../knex.types.js'
import type { MsgContent, SendOptions } from '../msg-manager/index.msg.js'
import type { MsgManager } from '../msg-manager/msg-manager.js'
import type { QueueMetaManager } from '../queue-meta-manager/queue-meta-manager.js'
import type { Router } from '../router/router.js'

import { RouteMsgQueueNotExistAction, type SendRouteMsgOptions, type SendRouteMsgResultItem } from './route-msg.types.js'


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

    const onQueueNotExist = options.onQueueNotExist ?? RouteMsgQueueNotExistAction.Ignore

    const route = await this.router.getOne({ routeName, trx })
    assert(route, `Route ${routeName} not exist`)
    assert(route.queueIds.length > 0, `Route ${routeName} not bind to any queue`)

    const ret: SendRouteMsgResultItem[] = []
    for (const queueId of route.queueIds) {
      const queue = await this.queueMeta.getById({ queueId, trx })
      if (! queue) {
        if (onQueueNotExist === RouteMsgQueueNotExistAction.Throw) {
          await trx.rollback()
          throw new Error(`Queue ${queueId} not exist while sending route message ${routeName}`)
        }
        continue
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
    }

    if (! options.trx) {
      await trx.commit()
    }
    return ret
  }

}

