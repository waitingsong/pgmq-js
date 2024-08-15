/* c8 ignore start */

export type QueueString = `(string,string,string,string)`

export interface ListResp {
  list_queues: QueueString
}

export interface DropResp {
  drop_queue: boolean
}

export interface DetachArchiveResp {
  detach_archive: boolean
}


export interface PurgeResp {
  purge_queue: string
}

export interface MetricsResp {
  queue_name: string
  queue_length: string
  newest_msg_age_sec: string | null
  oldest_msg_age_sec: string | null
  /**
   * number of messages in the queue
   */
  total_messages: string
  scrape_time: string
}


/* c8 ignore stop */
