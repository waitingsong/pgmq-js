
/* eslint-disable @typescript-eslint/no-unsafe-argument */


import assert from 'node:assert'

import {
  App,
  Configuration,
  Inject,
  Logger,
  MS_CONSUMER_KEY,
  MidwayEnvironmentService,
  MidwayInformationService,
  MidwayWebRouterService,
  getClassMetadata,
  listModule,
  listPropertyDataFromClass,
} from '@midwayjs/core'
import type { ILifeCycle, ILogger } from '@midwayjs/core'
import { TraceInit } from '@mwcp/otel'
import {
  MConfig,
  deleteRouter,
} from '@mwcp/share'
import type { Application, IMidwayContainer } from '@mwcp/share'

import * as DefaultConfig from './config/config.default.js'
import * as LocalConfig from './config/config.local.js'
import * as UnittestConfig from './config/config.unittest.js'
import { useComponents } from './imports.js'
import type { ConsumerCallback, ConsumerMetadata, PgmqListenerOptionsMetadata, PgmqServer } from './lib/index.js'
import { initConsumerOptions } from './lib/mq.consumer/consumer.config.js'
import { PgmqManager } from './lib/pgmq-manager.js'
import { ConfigKey } from './lib/types.js'
import type { Config, MiddlewareConfig } from './lib/types.js'


@Configuration({
  namespace: ConfigKey.namespace,
  importConfigs: [
    {
      default: DefaultConfig,
      local: LocalConfig,
      unittest: UnittestConfig,
    },
  ],
  imports: useComponents,
})
export class AutoConfiguration implements ILifeCycle {

  @App() readonly app: Application

  @Inject() protected readonly environmentService: MidwayEnvironmentService
  @Inject() protected readonly informationService: MidwayInformationService
  @Inject() protected readonly webRouterService: MidwayWebRouterService

  @Logger() protected readonly logger: ILogger

  @MConfig(ConfigKey.config) protected readonly config: Config
  @MConfig(ConfigKey.middlewareConfig) protected readonly mwConfig: MiddlewareConfig

  @Inject() protected readonly pgmqServer: PgmqServer

  async onConfigLoad(): Promise<void> {
    /* c8 ignore next 3 */
    if (! this.config.enableDefaultRoute) {
      await deleteRouter(`/_${ConfigKey.namespace}`, this.webRouterService)
    }
    else if (this.mwConfig.ignore) {
      this.mwConfig.ignore.push(new RegExp(`/_${ConfigKey.namespace}/.+`, 'u'))
    }
  }

  @TraceInit({ namespace: ConfigKey.namespace })
  async onReady(container: IMidwayContainer): Promise<void> {
    void container
    assert(
      this.app,
      'this.app undefined. If start for development, please set env first like `export MIDWAY_SERVER_ENV=local`',
    )

    const subscriberModules = listModule(MS_CONSUMER_KEY, (module) => {
      const metadata: ConsumerMetadata = getClassMetadata(MS_CONSUMER_KEY, module)
      return metadata.type === 'pgmq'
    })

    const moduleCache = new Map<object, unknown>()

    for (const module of subscriberModules) {
      const consumerMetadata: ConsumerMetadata = getClassMetadata(MS_CONSUMER_KEY, module)

      const listenerMetadata = listPropertyDataFromClass(MS_CONSUMER_KEY, module) as PgmqListenerOptionsMetadata[][]

      const pms: Promise<void>[] = []
      for (const arr of listenerMetadata) {
        // 循环绑定的方法和监听的配置信息
        for (const listenerOptions of arr) {
          let clzInstance = moduleCache.get(module)
          if (! clzInstance) {
            clzInstance = await container.getAsync(module)
            moduleCache.set(module, clzInstance)
          }
          assert(clzInstance, 'clzInstance not found')
          // @ts-ignore
          const fn = clzInstance[listenerOptions.propertyKey] as ConsumerCallback
          assert(typeof fn === 'function', 'fn not function')

          const opts = {
            ...initConsumerOptions,
            ...consumerMetadata.metadata, // class level
            ...listenerOptions, // method level
          }
          const pm = this.pgmqServer.registerListener(opts, fn.bind(clzInstance))
            /* c8 ignore next 4 */
            .catch((ex) => {
              console.error('registerListener error on start:', ex)
              throw ex
            })
          pms.push(pm)
          // await this.pgmqServer.registerListener(opts, fn.bind(clzInstance)).catch(console.error)
        }
      }
      await Promise.all(pms)
      moduleCache.clear()
    }

    this.logger.info(`[${ConfigKey.componentName}] onReady`)
  }

  async onStop(container: IMidwayContainer): Promise<void> {
    this.logger.info(`[${ConfigKey.componentName}] stopping PgmqServer ...`)
    this.pgmqServer.close()

    this.logger.info(`[${ConfigKey.componentName}] stopping PgmqManager ...`)
    const dbSourceManager = await container.getAsync(PgmqManager)
    // void dbSourceManager.getName()
    const dbSources = dbSourceManager.getAllDataSources()
    await Promise.all(
      Array.from(dbSources.values()).map(async (db) => {
        await dbSourceManager.destroyDataSource(db)
      }),
    )
    this.logger.info(`[${ConfigKey.componentName}] stopped`)
  }

}

