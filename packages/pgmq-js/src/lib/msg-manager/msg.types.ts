
export type MsgId = `${bigint}`

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

