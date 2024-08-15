
export type MsgId = `${bigint}`

export interface Message<T extends object = object> {
  msgId: MsgId
  message: T
  enqueuedAt: DateString
  /** read count number */
  readCt: number
  vt: DateString
}

type DateString = string
