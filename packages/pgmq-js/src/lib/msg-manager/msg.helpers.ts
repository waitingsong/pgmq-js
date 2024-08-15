import type { RecordSnakeKeys } from '@waiting/shared-types'

import type { Message } from './msg.types.js'


export function parseMessage(input: RecordSnakeKeys<Message>): Message {
  const ret: Message = {
    msgId: input.msg_id,
    message: input.message,
    enqueuedAt: input.enqueued_at,
    readCt: input.read_ct,
    vt: input.vt,
  }
  return ret
}
