import { Body, ContentType, Controller, Inject, Post } from '@midwayjs/core'
import { ApiResponse, ApiTags } from '@midwayjs/swagger'
import { MConfig } from '@mwcp/share'

import { ApiNotEnabledHttpError } from '##/app/error.js'
import { Config, ConfigKey } from '##/lib/types.js'

import { MessageDto, MsgApi } from '../msg.dto.js'
import { MsgMsg } from '../msg.types.js'

import {
  MsgReadBatchDto,
  MsgReadDto,
  MsgReadWithPollDto,
  MsgSetVtDto,
} from './msg.read.dto.js'
import { MsgReadRepo } from './msg.read.repo.js'


@ApiTags(['Msg Read'])
@Controller(MsgApi.base)
export class MsgController {

  @MConfig(ConfigKey.config) private readonly config: Config
  @Inject() private readonly repo: MsgReadRepo


  @Post(`/${MsgApi.read}`)
  @ContentType('application/json')
  @ApiResponse({
    type: MessageDto,
    description: MsgMsg.read,
  })
  async read(@Body() input: MsgReadDto): Promise<MessageDto | null> {
    if (! this.config.enableApi) { throw new ApiNotEnabledHttpError() }

    const msg = await this.repo.read(input)
    return msg
  }

  @Post(`/${MsgApi.readWithPoll}`)
  @ContentType('application/json')
  @ApiResponse({
    type: MessageDto,
    isArray: true,
    description: MsgMsg.readWithPoll,
  })
  async readWithPoll(@Body() input: MsgReadWithPollDto): Promise<MessageDto[]> {
    if (! this.config.enableApi) { throw new ApiNotEnabledHttpError() }

    const msg = await this.repo.readWithPoll(input)
    return msg
  }

  @Post(`/${MsgApi.readBatch}`)
  @ContentType('application/json')
  @ApiResponse({
    type: MessageDto,
    isArray: true,
    description: MsgMsg.readBatch,
  })
  async readBatch(@Body() input: MsgReadBatchDto): Promise<MessageDto[]> {
    if (! this.config.enableApi) { throw new ApiNotEnabledHttpError() }

    const msg = await this.repo.readBatch(input)
    return msg
  }


  // #region setVt

  @Post(`/${MsgApi.setVt}`)
  @ContentType('application/json')
  @ApiResponse({
    type: MessageDto,
    description: MsgMsg.setVt,
  })
  async setVt(@Body() input: MsgSetVtDto): Promise<MessageDto | null> {
    if (! this.config.enableApi) { throw new ApiNotEnabledHttpError() }

    const msg = await this.repo.setVt(input)
    return msg
  }
}

