/* c8 ignore start */
import type { MsgId } from './msg.types.js'


export interface SendResp {
  send: MsgId
}

export interface SendBatchResp {
  send_batch: MsgId
}

export interface DeleteResp {
  delete: boolean
}

export interface DeleteBatchResp {
  delete: MsgId
}

export interface ArchiveResp {
  archive: boolean
}

export interface ArchiveBatchResp {
  archive: MsgId
}

/* c8 ignore stop */
