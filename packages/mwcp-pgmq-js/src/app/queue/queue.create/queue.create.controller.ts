import { Body, Controller, Inject, Post } from '@midwayjs/core'
import { ApiResponse, ApiTags } from '@midwayjs/swagger'
import { MConfig } from '@mwcp/share'

import { ApiNotEnabledHttpError } from '##/app/error.js'
import { Config, ConfigKey } from '##/lib/types.js'

import { CommonQueueDto, QueueApi } from '../queue.dto.js'
import { QueueMsg } from '../queue.types.js'

import { QueueCreateRepo } from './queue.create.repo.js'


@ApiTags(['Queue Create'])
@Controller(QueueApi.base)
export class QueueCreateController {

  @MConfig(ConfigKey.config) private readonly config: Config
  @Inject() private readonly repo: QueueCreateRepo

  // #region create

  @Post(`/${QueueApi.create}`)
  @ApiResponse({
    type: 'ok',
    description: QueueMsg.create,
  })
  async create(@Body() input: CommonQueueDto): Promise<'ok'> {
    if (! this.config.enableApi) { throw new ApiNotEnabledHttpError() }

    await this.repo.create({ queue: input.queue })
    return 'ok'
  }

  @Post(`/${QueueApi.createUnlogged}`)
  @ApiResponse({
    type: 'ok',
    description: QueueMsg.createUnlogged,
  })
  async createUnlogged(@Body() input: CommonQueueDto): Promise<'ok'> {
    if (! this.config.enableApi) { throw new ApiNotEnabledHttpError() }

    await this.repo.createUnlogged({ queue: input.queue })
    return 'ok'
  }

}

