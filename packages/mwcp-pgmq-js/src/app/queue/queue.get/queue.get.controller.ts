import { ContentType, Controller, Get, Inject, Param } from '@midwayjs/core'
import { ApiResponse, ApiTags } from '@midwayjs/swagger'
import { MConfig } from '@mwcp/share'

import { ApiNotEnabledHttpError } from '##/app/error.js'
import { Config, ConfigKey } from '##/lib/types.js'


import { QueueApi, QueueDto } from '../queue.dto.js'
import { QueueMsg } from '../queue.types.js'

import { QueueGetRepo } from './queue.get.repo.js'


@ApiTags(['Queue Get'])
@Controller(QueueApi.base)
export class QueueGetController {

  @MConfig(ConfigKey.config) private readonly config: Config
  @Inject() private readonly repo: QueueGetRepo

  // #region hasQueue

  @Get(`/${QueueApi.hasQueue}/:name`)
  @ApiResponse({
    type: 'boolean',
    description: QueueMsg.hasQueue,
  })
  async hasQueue(@Param('name') name: string): Promise<boolean> {
    if (! this.config.enableApi) { throw new ApiNotEnabledHttpError() }

    const res = await this.repo.hasQueue({ queue: name.toLowerCase() })
    return res
  }

  // #region get

  @Get(`/${QueueApi.getOne}/:name`)
  @ApiResponse({
    type: QueueDto,
    description: QueueMsg.getOne,
  })
  @ContentType('application/json')
  async getOne(@Param('name') name: string): Promise<QueueDto | null> {
    if (! this.config.enableApi) { throw new ApiNotEnabledHttpError() }

    const res = await this.repo.getOne({ queue: name.toLowerCase() })
    return res
  }

  @Get(`/${QueueApi.list}`)
  @ApiResponse({
    type: QueueDto,
    isArray: true,
    description: QueueMsg.list,
  })
  @ContentType('application/json')
  async list(): Promise<QueueDto[]> {
    if (! this.config.enableApi) { throw new ApiNotEnabledHttpError() }

    const res = await this.repo.list()
    return res
  }

}

