import { Body, Controller, ContentType, Inject, Post } from '@midwayjs/core'
import { ApiResponse, ApiTags } from '@midwayjs/swagger'
import { MConfig } from '@mwcp/share'

import { ApiNotEnabledHttpError } from '##/app/error.js'
import { MsgId } from '##/index.js'
import { Config, ConfigKey } from '##/lib/types.js'

import { MsgApi } from '../msg.dto.js'
import { MsgMsg } from '../msg.types.js'

import { MsgSendBatchDto, MsgSendDto } from './msg.send.dto.js'
import { MsgSendRepo } from './msg.send.repo.js'


@ApiTags(['Msg Send'])
@Controller(MsgApi.base)
export class MsgSendController {

  @MConfig(ConfigKey.config) private readonly config: Config
  @Inject() private readonly repo: MsgSendRepo


  @Post(`/${MsgApi.send}`)
  @ContentType('application/json')
  @ApiResponse({
    type: 'string',
    isArray: true,
    description: MsgMsg.send,
  })
  async send(@Body() input: MsgSendDto): Promise<MsgId[]> {
    if (! this.config.enableApi) { throw new ApiNotEnabledHttpError() }

    const msgId = await this.repo.send(input)
    return msgId
  }


  @Post(`/${MsgApi.sendBatch}`)
  @ContentType('application/json')
  @ApiResponse({
    type: 'string',
    isArray: true,
    description: MsgMsg.sendBatch,
  })
  async sendBatch(@Body() input: MsgSendBatchDto): Promise<MsgId[]> {
    if (! this.config.enableApi) { throw new ApiNotEnabledHttpError() }

    const msgId = await this.repo.sendBatch(input)
    return msgId
  }

}

