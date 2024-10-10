import { ContentType, Controller, Get, Inject, Param } from '@midwayjs/core'
import { ApiResponse, ApiTags } from '@midwayjs/swagger'
import { MConfig } from '@mwcp/share'

import { ApiNotEnabledHttpError } from '##/app/error.js'
import { Config, ConfigKey } from '##/lib/types.js'


import { QueueApi, QueueMetricsDto } from '../queue.dto.js'
import { QueueMsg } from '../queue.types.js'

import { QueueMetricsRepo } from './queue.metrics.repo.js'


@ApiTags(['Queue Metrics'])
@Controller(QueueApi.base)
export class QueueMetricsController {

  @MConfig(ConfigKey.config) private readonly config: Config
  @Inject() private readonly repo: QueueMetricsRepo


  @Get(`/${QueueApi.metrics}/:name`)
  @ApiResponse({
    type: QueueMetricsDto,
    description: QueueMsg.metrics,
  })
  @ContentType('application/json')
  async metrics(@Param('name') name: string): Promise<QueueMetricsDto | null> {
    if (! this.config.enableApi) { throw new ApiNotEnabledHttpError() }

    const res = await this.repo.metrics({ queue: name.toLowerCase() })
    return res
  }

  @Get(`/${QueueApi.metricsAll}`)
  @ApiResponse({
    type: QueueMetricsDto,
    isArray: true,
    description: QueueMsg.metricsAll,
  })
  @ContentType('application/json')
  async metricsAll(): Promise<QueueMetricsDto[]> {
    if (! this.config.enableApi) { throw new ApiNotEnabledHttpError() }

    const res = await this.repo.metricsAll()
    return res
  }
}

