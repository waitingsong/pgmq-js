import { Body, ContentType, Controller, Inject, Post } from '@midwayjs/core'
import { ApiResponse, ApiTags } from '@midwayjs/swagger'
import { MConfig } from '@mwcp/share'

import { ApiNotEnabledHttpError } from '##/app/error.js'
import { MsgId } from '##/index.js'
import { Config, ConfigKey } from '##/lib/types.js'

import { MsgApi } from '../msg.dto.js'
import { MsgMsg } from '../msg.types.js'

import { MsgArchiveBatchDto, MsgArchiveDto } from './msg.archive.dto.js'
import { MsgArchiveRepo } from './msg.archive.repo.js'


@ApiTags(['Msg Archive'])
@Controller(MsgApi.base)
export class MsgArchiveController {

  @MConfig(ConfigKey.config) private readonly config: Config
  @Inject() private readonly repo: MsgArchiveRepo


  @Post(`/${MsgApi.archive}`)
  @ContentType('application/json')
  @ApiResponse({
    type: 'string',
    isArray: true,
    description: MsgMsg.archive,
  })
  async archive(@Body() input: MsgArchiveDto): Promise<MsgId[]> {
    if (! this.config.enableApi) { throw new ApiNotEnabledHttpError() }

    const flag = await this.repo.archive(input)
    return flag
  }

  @Post(`/${MsgApi.archiveBatch}`)
  @ContentType('application/json')
  @ApiResponse({
    type: 'string',
    isArray: true,
    description: MsgMsg.deleteBatch,
  })
  async archiveBatch(@Body() input: MsgArchiveBatchDto): Promise<MsgId[]> {
    if (! this.config.enableApi) { throw new ApiNotEnabledHttpError() }

    const msgIds = await this.repo.archiveBatch(input)
    return msgIds
  }

}

