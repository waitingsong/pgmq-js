/* c8 ignore start */

export interface Queue {
  name: string
  isPartitioned: boolean
  isUnlogged: boolean
  createdAt: Date
}

export interface QueueMetrics {
  queueName: string
  /** Number of messages currently in the queue */
  queueLength: string
  newestMsgAgeSec: number | null
  oldestMsgAgeSec: number | null
  /** Total number of messages that have passed through the queue over all time */
  totalMessages: string
  /** The current timestamp */
  scrapeTime: Date
}

/* c8 ignore stop */
