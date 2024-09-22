import { ApiProperty } from '@midwayjs/swagger'
import { Rule } from '@midwayjs/validate'
import { commonValidSchemas } from '@mwcp/share'
import type { SendBatchOptions, SendOptions } from '@waiting/pgmq-js'

import { CommonMsgDto } from '../msg.dto.js'


// #region send

export class MsgSendDto extends CommonMsgDto implements Omit<SendOptions, 'trx'> {
  @ApiProperty({ example: { foo: 'bar' }, description: '消息内容' })
  @Rule(commonValidSchemas.object.allow(null))
  msg: object | null

  @ApiProperty({ example: 0, description: '消息延迟可见时间（秒）', default: 0 })
  @Rule(commonValidSchemas.naturalNumber)
  delay?: number
}

export class MsgSendBatchDto extends CommonMsgDto implements Omit<SendBatchOptions, 'trx'> {
  @ApiProperty({ example: [{ id: 1 }, { id: 2 }], description: '消息内容' })
  @Rule(commonValidSchemas.array.items(commonValidSchemas.object))
  msgs: object[]

  @ApiProperty({ example: 0, description: '消息延迟可见时间（秒）', default: 0 })
  @Rule(commonValidSchemas.naturalNumber.default(0))
  delay?: number
}

