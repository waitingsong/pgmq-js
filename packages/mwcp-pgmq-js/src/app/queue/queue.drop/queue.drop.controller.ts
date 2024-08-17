import { Body, Controller, Inject, Post } from '@midwayjs/core'
import { ApiResponse, ApiTags } from '@midwayjs/swagger'
import { MConfig } from '@mwcp/share'

import { ApiNotEnabledHttpError } from '##/app/error.js'
import { Config, ConfigKey } from '##/lib/types.js'


import { CommonQueueDto, QueueApi } from '../queue.dto.js'
import { QueueMsg } from '../queue.types.js'

import { QueueDropRepo } from './queue.drop.repo.js'


@ApiTags(['Queue Drop'])
@Controller(QueueApi.base)
export class QueueDropController {

  @MConfig(ConfigKey.config) private readonly config: Config
  @Inject() private readonly repo: QueueDropRepo

  @Post(`/${QueueApi.drop}`)
  @ApiResponse({
    type: 'boolean',
    description: QueueMsg.drop,
  })
  async drop(@Body() input: CommonQueueDto): Promise<boolean> {
    if (! this.config.enableApi) { throw new ApiNotEnabledHttpError() }

    const res = await this.repo.drop(input.name)
    return res
  }

  // #region purge

  @Post(`/${QueueApi.purge}`)
  @ApiResponse({
    type: 'boolean',
    description: QueueMsg.purge,
  })
  async purge(@Body() input: CommonQueueDto): Promise<string> {
    if (! this.config.enableApi) { throw new ApiNotEnabledHttpError() }

    const res = await this.repo.purge(input.name)
    return res
  }

  @Post(`/${QueueApi.detachArchive}`)
  @ApiResponse({
    type: 'void',
    description: QueueMsg.detachArchive,
  })
  async detachArchive(@Body() input: CommonQueueDto): Promise<void> {
    if (! this.config.enableApi) { throw new ApiNotEnabledHttpError() }

    await this.repo.detachArchive(input.name)
  }

}

