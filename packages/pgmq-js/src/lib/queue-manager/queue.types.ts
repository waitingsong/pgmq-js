/* c8 ignore start */

export interface Queue {
  /** Maximum 60 characters; alphanumeric characters, underscores (_) are allowed */
  queue: string
  isPartitioned: boolean
  isUnlogged: boolean
  createdAt: Date
}

export interface QueueDto {
  queue: string
  isPartitioned: boolean
  isUnlogged: boolean
  createdAt: string
}

export interface QueueMetrics {
  queue: string
  /** Number of messages currently in the queue */
  queueLength: string
  newestMsgAgeSec: number | null
  oldestMsgAgeSec: number | null
  /**
   * Total number of messages that have passed through the queue over all time,
   * will visible if out of transaction
   */
  totalMessages: string
  /** The current timestamp */
  scrapeTime: Date
}

export interface QueueMetricsDto {
  queue: string
  /** Number of messages currently in the queue */
  queueLength: string
  newestMsgAgeSec: number | null
  oldestMsgAgeSec: number | null
  /** Total number of messages that have passed through the queue over all time */
  totalMessages: string
  /** The current timestamp */
  scrapeTime: string
}

// export interface QueueMeta {
//   queue: string
//   queueId: number
//   queueKey: string | null
//   json: object | null
//   ctime: Date
//   mtime: Date | null
// }


/* c8 ignore stop */
