/* c8 ignore start */

export interface Queue {
  name: string
  isPartitioned: boolean
  isUnlogged: boolean
  createdAt: Date
}

export interface QueueMetrics {
  queueName: string
  queueLength: string
  newestMsgAgeSec: number | null
  oldestMsgAgeSec: number | null
  totalMessages: string
  scrapeTime: Date
}

/* c8 ignore stop */
