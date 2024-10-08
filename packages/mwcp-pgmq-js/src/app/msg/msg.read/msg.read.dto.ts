import { ApiProperty } from '@midwayjs/swagger'
import { Rule } from '@midwayjs/validate'
import { commonValidSchemas } from '@mwcp/share'
import type { ReadBatchOptions, ReadOptions, ReadWithPollOptions, SetVtOptions } from '@waiting/pgmq-js'

import type { MsgId } from '##/index.js'

import { CommonMsgDto } from '../msg.dto.js'


export class MsgReadDto extends CommonMsgDto implements Omit<ReadOptions, 'trx'> {
  @ApiProperty({ example: 1, description: '消息读取后延迟可见时间（秒）', default: 1 })
  @Rule(commonValidSchemas.naturalNumber.default(1))
  vt?: number
}

export class MsgReadBatchDto extends MsgReadDto implements Omit<ReadBatchOptions, 'trx'> {
  @ApiProperty({ example: 2, description: '读取数量', default: 1 })
  @Rule(commonValidSchemas.positiveInt.default(1))
  qty?: number
}

export class MsgReadWithPollDto extends CommonMsgDto implements Omit<ReadWithPollOptions, 'trx'> {
  @ApiProperty({ example: 1, description: '消息读取后延迟可见时间（秒）', default: 1 })
  @Rule(commonValidSchemas.naturalNumber.default(1))
  vt?: number

  @ApiProperty({ example: 2, description: '读取数量', default: 1 })
  @Rule(commonValidSchemas.positiveInt.default(1))
  qty?: number

  @ApiProperty({ example: 5, description: '最大轮询时间（秒）', default: 5 })
  @Rule(commonValidSchemas.positiveInt.default(5))
  maxPollSeconds?: number

  @ApiProperty({ example: 100, description: '轮询间隔时间（毫秒）', default: 100 })
  @Rule(commonValidSchemas.positiveInt.default(100))
  pollIntervalMs?: number
}

// #region setVt

export class MsgSetVtDto extends CommonMsgDto implements Omit<SetVtOptions, 'trx'> {
  @ApiProperty({ example: 1, description: '' })
  @Rule(commonValidSchemas.positiveInt.required())
  msgId: MsgId

  @ApiProperty({ example: 2, description: '消息延迟可见秒数' })
  @Rule(commonValidSchemas.naturalNumber.required())
  vt: number
}

