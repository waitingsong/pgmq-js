import { ApiProperty } from '@midwayjs/swagger'
import { Rule } from '@midwayjs/validate'
import { commonValidSchemas } from '@mwcp/share'
import { MessageDto as _MessageDto } from '@waiting/pgmq-js'

import { MsgId, MsgContent } from '##/index.js'
import { ConfigKey } from '##/lib/types.js'


export class MsgApi {
  static readonly base: string = `/${ConfigKey.namespace}/msg`
  static readonly send = 'send'
  static readonly sendBatch = 'send_batch'
  static readonly read = 'read'
  static readonly readWithPoll = 'read_with_poll'
  static readonly readBatch = 'read_batch'
  static readonly pop = 'pop'
  static readonly delete = 'delete'
  static readonly deleteBatch = 'delete_batch'
  static readonly archive = 'archive'
  static readonly archiveBatch = 'archive_batch'
  static readonly setVt = 'set_vt'
}

export class CommonMsgDto {
  @ApiProperty({ example: 'my_queue', description: '队列名' })
  @Rule(commonValidSchemas.identifier.max(60).lowercase().required())
  queueName: string
}

export class MessageDto<T extends MsgContent = MsgContent> implements _MessageDto<T> {
  @ApiProperty({ example: '1', description: '消息id' })
  @Rule(commonValidSchemas.bigintString.required())
  msgId: MsgId

  @ApiProperty({ example: { foo: 'bar' }, description: '消息内容' })
  @Rule(commonValidSchemas.object.allow(null))
  message: T

  @ApiProperty({ example: '2024-07-01T00:00:00.000Z', description: '入队时间' })
  @Rule(commonValidSchemas.isoDate.required())
  enqueuedAt: string

  /** read count number */
  @ApiProperty({ example: 1, description: '读取次数' })
  @Rule(commonValidSchemas.naturalNumber.required())
  readCt: number

  @ApiProperty({ example: '2024-07-01T00:00:01.000Z', description: '消息可见时间' })
  @Rule(commonValidSchemas.isoDate.required())
  vt: string
}

