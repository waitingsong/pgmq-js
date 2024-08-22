import { Controller, Get, Inject } from '@midwayjs/core'
import { MConfig } from '@mwcp/share'
import type { Context } from '@mwcp/share'

import { apiBase, apiMethod } from '../types/api-test.js'
import { ConfigKey } from '../types/lib-types.js'
import type { Config, MiddlewareConfig } from '../types/lib-types.js'
import type { RespData } from '../types/root.config.js'

import { ConsumerTestService } from './300s.consumer.service.js'


@Controller(apiBase.consumer)
export class ConsumerTestController {

  @MConfig(ConfigKey.config) protected readonly config: Config
  @MConfig(ConfigKey.middlewareConfig) protected readonly mwConfig: MiddlewareConfig

  @Inject() readonly consumer: ConsumerTestService

  @Get(`/${apiMethod.hello}`)
  async hello(ctx: Context): Promise<RespData> {
    void this.consumer
    const {
      cookies,
      header,
      url,
    } = ctx

    const res = {
      cookies,
      header,
      url,
    }
    return res
  }

}

