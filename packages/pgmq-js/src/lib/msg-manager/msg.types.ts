
export type MsgId = `${bigint}`

export type MsgContent = object | null

export interface Message<T extends MsgContent = MsgContent> {
  msgId: MsgId
  message: T
  enqueuedAt: DateString
  /** read count number */
  readCt: number
  vt: DateString
}

type DateString = string
