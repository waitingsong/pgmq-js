import { ApiProperty } from '@midwayjs/swagger'
import { Rule } from '@midwayjs/validate'
import { commonValidSchemas } from '@mwcp/share'
import { QueueDto as _QueueDto, QueueMetricsDto as _QueueMetricsDto } from '@waiting/pgmq-js'

import { ConfigKey } from '##/lib/types.js'


export class QueueApi {
  static readonly base: string = `/${ConfigKey.namespace}/queue`
  static readonly create = 'create'
  static readonly createUnlogged = 'create_unlogged'
  static readonly hasQueue = 'has_queue'
  static readonly getOne = 'get_one'
  static readonly list = 'list'
  static readonly drop = 'drop'
  static readonly purge = 'purge'
  static readonly detachArchive = 'detach_archive'
  static readonly metrics = 'metrics'
  static readonly metricsAll = 'metrics_all'
}

export class CommonQueueDto {
  @ApiProperty({ example: 'my_queue', description: '队列名, Maximum 60 characters; alphanumeric characters, underscores (_) are allowed.' })
  @Rule(commonValidSchemas.identifier.max(60).lowercase().required())
  queue: string
}

export class QueueDto implements _QueueDto {
  @ApiProperty({ example: 'my_queue', description: '队列名' })
  @Rule(commonValidSchemas.identifier.max(60).lowercase().required())
  queue: string

  @ApiProperty({ example: false, description: '是否分区' })
  @Rule(commonValidSchemas.boolean.required())
  isPartitioned: boolean

  @ApiProperty({ example: false, description: '是否无日志' })
  @Rule(commonValidSchemas.boolean.required())
  isUnlogged: boolean

  @ApiProperty({ example: '2021-01-01T00:00:00.000Z', description: '创建时间' })
  @Rule(commonValidSchemas.isoDate.required())
  createdAt: string
}


export class QueueMetricsDto implements _QueueMetricsDto {
  @ApiProperty({ example: 'my_queue', description: '队列名, Maximum 60 characters; alphanumeric characters, underscores (_) are allowed.' })
  @Rule(commonValidSchemas.identifier.max(60).lowercase().required())
  queue: string

  @ApiProperty({ example: '10', description: '队列中消息数量' })
  @Rule(commonValidSchemas.bigintString.required())
  queueLength: string

  @ApiProperty({ example: 1, description: '最新消息年龄（秒）' })
  @Rule(commonValidSchemas.positiveInt.allow(null))
  newestMsgAgeSec: number | null

  @ApiProperty({ example: 300, description: '最旧消息年龄（秒）' })
  @Rule(commonValidSchemas.positiveInt.allow(null))
  oldestMsgAgeSec: number | null

  @ApiProperty({ example: '100', description: '队列接受消息总数' })
  @Rule(commonValidSchemas.bigintString.required())
  totalMessages: string

  @ApiProperty({ example: '2021-01-01T00:00:00.000Z', description: '抓取时间' })
  @Rule(commonValidSchemas.isoDate.required())
  scrapeTime: string
}

