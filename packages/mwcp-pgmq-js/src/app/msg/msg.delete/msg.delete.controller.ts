import { Body, ContentType, Controller, Inject, Post } from '@midwayjs/core'
import { ApiResponse, ApiTags } from '@midwayjs/swagger'
import { MConfig } from '@mwcp/share'

import { ApiNotEnabledHttpError } from '##/app/error.js'
import { MsgId } from '##/index.js'
import { Config, ConfigKey } from '##/lib/types.js'

import { MessageDto, MsgApi } from '../msg.dto.js'
import { MsgMsg } from '../msg.types.js'

import { MsgDeleteBatchDto, MsgDeleteDto, MsgPopDto } from './msg.delete.dto.js'
import { MsgDeleteRepo } from './msg.delete.repo.js'


@ApiTags(['Msg Delete'])
@Controller(MsgApi.base)
export class MsgDeleteController {

  @MConfig(ConfigKey.config) private readonly config: Config
  @Inject() private readonly repo: MsgDeleteRepo


  @Post(`/${MsgApi.pop}`)
  @ContentType('application/json')
  @ApiResponse({
    type: MessageDto,
    description: MsgMsg.pop,
  })
  async pop(@Body() input: MsgPopDto): Promise<MessageDto | null> {
    if (! this.config.enableApi) { throw new ApiNotEnabledHttpError() }

    const msg = await this.repo.pop(input)
    return msg
  }


  @Post(`/${MsgApi.delete}`)
  @ContentType('application/json')
  @ApiResponse({
    type: 'boolean',
    description: MsgMsg.delete,
  })
  async delete(@Body() input: MsgDeleteDto): Promise<MsgId[]> {
    if (! this.config.enableApi) { throw new ApiNotEnabledHttpError() }

    const flag = await this.repo.delete(input)
    return flag
  }

  @Post(`/${MsgApi.deleteBatch}`)
  @ContentType('application/json')
  @ApiResponse({
    type: 'string',
    isArray: true,
    description: MsgMsg.deleteBatch,
  })
  async deleteBatch(@Body() input: MsgDeleteBatchDto): Promise<MsgId[]> {
    if (! this.config.enableApi) { throw new ApiNotEnabledHttpError() }

    const msgIds = await this.repo.deleteBatch(input)
    return msgIds
  }

}

