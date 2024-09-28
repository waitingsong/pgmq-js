/* c8 ignore start */
import type { Transaction } from '../knex.types.js'
import type { MsgContent, MsgId } from '../msg-manager/index.msg.js'
import type { QueueId } from '../queue-meta-manager/queue-meta.types.js'
import type { RouteId } from '../router/router.types.js'


/**
 * Send route message
 * @description Send a message to queues bind to the route
 */
export interface SendRouteMsgOptions<T extends MsgContent = MsgContent> {
  routeName: string
  msg: T
  /**
   * delay Time in seconds before the message becomes visible. Defaults to 0.
   * @default 0
   */
  delay?: number
  /**
   * Throw error if the route not exist or route not bind to any queue, although value is 'throw'
   * @default `RouteMsgQueueNotExistAction.Ignore`
   */
  onQueueNotExist?: RouteMsgQueueNotExistAction
  trx?: Transaction | null | undefined
}

export enum RouteMsgQueueNotExistAction {
  /**
   * Ignore queue not exist
   */
  Ignore = 'ignore',
  /**
   * Throw error if queue not exist
   */
  Throw = 'throw',
}

export interface SendRouteMsgResultItem {
  msgId: MsgId
  routeId: RouteId
  routeName: string
  queueId: QueueId
  queue: string
}

