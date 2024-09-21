import { ApiProperty } from '@midwayjs/swagger'
import { Rule } from '@midwayjs/validate'
import { commonValidSchemas } from '@mwcp/share'

import { MessageDto as _MessageDto, MsgReadWithPollDto } from '##/app/index.app.js'


export class ConsumerMessageDto extends _MessageDto {
  @ApiProperty({ example: 'my_queue', description: '队列名' })
  @Rule(commonValidSchemas.identifier.max(60).lowercase().required())
  queue: string
}

export interface ConsumerOptions {
  /**
   * Pgmq data source name
   * @default 'default'
   * @description propertyKey of `pgmqConfig.dataSource` in `config/config.*.ts`
   */
  sourceName: string
  /**
   * @default 10
   */
  qty: NonNullable<MsgReadWithPollDto['qty']>
  /**
   * Runtime value is `vt + maxPollSeconds`
   * @default 1(sec)
   */
  vt: NonNullable<MsgReadWithPollDto['vt']>
  /**
   * Auto create queue if not exists
   * @default true
   */
  autoCreateQueue: boolean

  /**
   * Auto delete/archive message
   * @default 'delete'
   */
  consumeAction: 'delete' | 'archive' | false
  /**
   * Consume action at before/after of the callback,
   * @default 'after'
   */
  consumeActionAt: 'before' | 'after'

  /**
   * Queue connection number for parallel consume for one queue.
   * If order of message is important, set it to 1.
   * @default 1
   */
  queueConnectionNumber: number
  /**
   * @default 2(sec)
   */
  maxPollSeconds: NonNullable<MsgReadWithPollDto['maxPollSeconds']>
  /**
   * @default 100(ms)
   */
  pollIntervalMs: NonNullable<MsgReadWithPollDto['pollIntervalMs']>
}

export interface ConsumerMetadata {
  type: string
  metadata: Partial<ConsumerOptions>
}

export type ConsumerCallback<T extends ConsumerMessageDto = ConsumerMessageDto> = (msg: T) => Promise<unknown>

