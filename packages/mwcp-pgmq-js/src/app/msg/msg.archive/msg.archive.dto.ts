import { ApiProperty } from '@midwayjs/swagger'
import { Rule } from '@midwayjs/validate'
import { commonValidSchemas } from '@mwcp/share'
import type { DeleteBatchOptions, DeleteOptions } from '@waiting/pgmq-js'

import type { MsgId } from '##/index.js'

import { CommonMsgDto } from '../msg.dto.js'


export class MsgArchiveDto extends CommonMsgDto implements Omit<DeleteOptions, 'trx'> {
  @ApiProperty({ example: 1, description: '' })
  @Rule(commonValidSchemas.positiveInt.required())
  msgId: MsgId
}

export class MsgArchiveBatchDto extends CommonMsgDto implements Omit<DeleteBatchOptions, 'trx'> {
  @ApiProperty({ example: [1, 2], description: '' })
  @Rule(commonValidSchemas.array.items(commonValidSchemas.positiveInt.required()).required())
  msgIds: MsgId[]
}

