import type { BigIntStr, JsonObject } from '@waiting/shared-types'

import type { OptionsBase, QueueOptionsBase } from '../types.js'


export type MsgId = string // bigint as string

export type MsgContent = object | null

export interface Message<T extends MsgContent = MsgContent> {
  msgId: MsgId
  message: T
  enqueuedAt: Date
  /** read count number */
  readCt: number
  vt: Date
}

export interface MessageDto<T extends MsgContent = MsgContent> {
  msgId: MsgId
  message: T
  enqueuedAt: string
  /** read count number */
  readCt: number
  vt: string
}


export type PopOptions = QueueOptionsBase
type TimeStampStr = string

/**
 * Send a message to the queue or queues (without creating a route)
 * @link https://tembo-io.github.io/pgmq/api/sql/functions/#send
 * @param delay Time in seconds before the message becomes visible. Defaults to 0.
 */
export interface SendOptions<T extends MsgContent = MsgContent> extends OptionsBase {
  queue: string | string[]
  msg: T
  /**
   * @default 0
   */
  delay?: number | TimeStampStr
}

/**
 * Send multiple messages to the queue or queues (without creating a route)
 * @param delay Time in seconds before the message becomes visible. Defaults to 0.
 */
export interface SendBatchOptions<T extends MsgContent = MsgContent> extends OptionsBase {
  queue: string | string[]
  msgs: T[]
  /**
   * @default 0
   */
  delay?: number | TimeStampStr
}

/**
 * @link https://tembo.io/pgmq/api/sql/functions/#read
 */
export interface ReadOptions extends QueueOptionsBase {
  /**
   * Time in seconds that the message become invisible after reading, defaults to 1
   */
  vt?: number
  conditional?: JsonObject
}

/**
 * Same as read(). Also provides convenient long-poll functionality.
 * When there are no messages in the queue, the function
 * call will wait for max_poll_seconds in duration before returning.
 * If messages reach the queue during that duration, they will be read and returned immediately.
 *
 * @link https://tembo-io.github.io/pgmq/api/sql/functions/#read_with_poll
 * @note Ensure max_poll_seconds less than the timeout of the statement_timeout in the dbConfig (default 6000ms)
 */
export interface ReadWithPollOptions extends Omit<ReadOptions, 'trx'> {
  /**
   * The number of messages to read from the queue
   * @default 1
   */
  qty?: number
  /**
   * Time in seconds to wait for new messages to reach the queue, defaults to 5(s)
   * @default 5
   */
  maxPollSeconds?: number
  /**
   * Milliseconds between the internal poll operations, defaults to 100(ms)
   * @default 100
   */
  pollIntervalMs?: number
}

/**
 * Read multiple messages from the queue
 */
export interface ReadBatchOptions extends ReadOptions {
  /**
   * The number of messages to read from the queue
   * @default 1
   */
  qty?: number
}

export interface DeleteOptions extends QueueOptionsBase {
  msgId: BigIntStr | number
}

export interface DeleteBatchOptions extends QueueOptionsBase {
  msgIds: (BigIntStr | number)[]
}

export interface SetVtOptions extends QueueOptionsBase {
  msgId: BigIntStr | number
  /**
   * Duration from now, in seconds, that the message's VT should be set to
   */
  vt: number
}

