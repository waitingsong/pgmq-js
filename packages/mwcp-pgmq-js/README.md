# @waiting/pgmq-js repository

Postgres Message Queue (PGMQ) Component for [Midway.js]


[![GitHub tag](https://img.shields.io/github/tag/waitingsong/pgmq-js.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![](https://img.shields.io/badge/lang-TypeScript-blue.svg)]()
[![ci](https://github.com/waitingsong/pgmq-js/actions/workflows/nodejs.yml/badge.svg
)](https://github.com/waitingsong/pgmq-js/actions)
[![codecov](https://codecov.io/gh/waitingsong/pgmq-js/graph/badge.svg?token=RSoBwfxEGn)](https://codecov.io/gh/waitingsong/pgmq-js)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)


## Installation

```sh
npm i @mwcp/pgmq
```

## Prepare

Start a Postgres instance with the PGMQ extension installed:

```sh
docker run -d --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 quay.io/tembo/pgmq-pg:latest
```

Create the pgmq extension
```sh
psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U$POSTGRES_USER -d $POSTGRES_DB -bq \
  -f database/ddl/extension.sql 
```


## Configuration

Update project `src/configuration.ts`
```ts
import { Configuration } from '@midwayjs/core'
import * as pgmq from '@mwcp/pgmq-js'

@Configuration({
  imports: [ pgmq ],
  importConfigs: [join(__dirname, 'config')],
})
export class ContainerConfiguration implements ILifeCycle {
}
```

## Usage

### Send Message
```ts
import { Init, Inject, Singleton } from '@midwayjs/core'
import { PgmqManager, MsgSendDto, type MsgId } from '@mwcp/pgmq'

@Singleton()
export class MsgRepo {
  @Inject() mqManager: PgmqManager
  @Inject() private readonly pgmqManager: PgmqManager
  protected msg: Pgmq['msg']

  @Init()
  async init(): Promise<void> {
    const mq = this.pgmqManager.getDataSource('default')
    this.msg = mq.msg
  }

  async send(options: MsgSendDto): Promise<MsgId[]> {
    const { queueName, msg, delay = 0 } = options
    return this.msg.send(queueName, msg, delay)
  }
}

```


### Consumer Decorator

```ts
import assert from 'node:assert'
import { Singleton, Init, Inject } from '@midwayjs/core'
import { Consumer, ConsumerMessageDto, PgmqListener, PgmqManager } from '@mwcp/pgmq'

@Consumer()
@Singleton()
export class DemoConsumerService {

  @Inject() protected readonly pgmqManager: PgmqManager

  readonly msgs1: ConsumerMessageDto[] = []
  readonly msgs2: ConsumerMessageDto[] = []
  readonly msgs3: ConsumerMessageDto[] = []

  @Init()
  async init(): Promise<void> {
    const pgmq = this.pgmqManager.getDataSource('default')
    assert(pgmq, `pgmq data source 'default' not found`)
    await pgmq.queue.create('q1').catch((err) => {
      assert(err instanceof Error)
      if (err.message.includes('already exists')) { return }
      throw err
    })
    await pgmq.queue.create('q2').catch(() => { return })
    await pgmq.queue.create('q3').catch(() => { return })
  }

  @PgmqListener({ queueName: 'q1' }) // default consumeAction is 'delete'
  @PgmqListener({ queueName: ['q2', 'q3'], consumeAction: 'archive' })
  async hello(msg: ConsumerMessageDto): Promise<void> {
    switch (msg.queueName) {
      case 'q1':
        this.msgs1.push(msg)
        break

      case 'q2':
        this.msgs2.push(msg)
        break

      case 'q3':
        this.msgs3.push(msg)
        break
    }
  }
}  
```


[More Examples](https://github.com/waitingsong/pgmq-js/tree/main/packages/mwcp-pgmq-js/test/lib)



## Swagger

```ts
npm run dev
```

Open url `http://127.0.0.1:7001/swagger-ui/index.html` with browser

[Link: api.swagger.json](https://raw.githubusercontent.com/waitingsong/pgmq-js/main/packages/mwcp-pgmq-js/asset/api.swagger.json)


## Supported API

- [x] [Sending Messages](https://tembo-io.github.io/pgmq/api/sql/functions/#sending-messages)
  - [x] [send](https://tembo-io.github.io/pgmq/api/sql/functions/#send)
  - [x] [send_batch](https://tembo-io.github.io/pgmq/api/sql/functions/#send_batch)
- [x] [Reading Messages](https://tembo-io.github.io/pgmq/api/sql/functions/#reading-messages)
  - [x] [read](https://tembo-io.github.io/pgmq/api/sql/functions/#read)
  - [x] [read_with_poll](https://tembo-io.github.io/pgmq/api/sql/functions/#read_with_poll)
  - [x] [pop](https://tembo-io.github.io/pgmq/api/sql/functions/#pop)
- [x] [Deleting/Archiving Messages](https://tembo-io.github.io/pgmq/api/sql/functions/#deletingarchiving-messages)
  - [x] [delete (single)](https://tembo-io.github.io/pgmq/api/sql/functions/#delete-single)
  - [x] [delete (batch)](https://tembo-io.github.io/pgmq/api/sql/functions/#delete-batch)
  - [x] [purge_queue](https://tembo-io.github.io/pgmq/api/sql/functions/#purge_queue)
  - [x] [archive (single)](https://tembo-io.github.io/pgmq/api/sql/functions/#archive-single)
  - [x] [archive (batch)](https://tembo-io.github.io/pgmq/api/sql/functions/#archive-batch)
- [ ] [Queue Management](https://tembo-io.github.io/pgmq/api/sql/functions/#queue-management)
  - [x] [create](https://tembo-io.github.io/pgmq/api/sql/functions/#create)
  - [ ] [create_partitioned](https://tembo-io.github.io/pgmq/api/sql/functions/#create_partitioned)
  - [x] [create_unlogged](https://tembo-io.github.io/pgmq/api/sql/functions/#create_unlogged)
  - [x] [detach_archive](https://tembo-io.github.io/pgmq/api/sql/functions/#detach_archive)
  - [x] [drop_queue](https://tembo-io.github.io/pgmq/api/sql/functions/#drop_queue)
- [x] [Utilities](https://tembo-io.github.io/pgmq/api/sql/functions/#utilities)
  - [x] [set_vt](https://tembo-io.github.io/pgmq/api/sql/functions/#set_vt)
  - [x] [list_queues](https://tembo-io.github.io/pgmq/api/sql/functions/#list_queues)
  - [x] [metrics](https://tembo-io.github.io/pgmq/api/sql/functions/#metrics)
  - [x] [metrics_all](https://tembo-io.github.io/pgmq/api/sql/functions/#metrics_all)


## License
[MIT](LICENSE)

### Languages
- [English](README.md)
- [中文](README.zh-CN.md)

<br>

[`pgmq-js`]: https://github.com/waitingsong/pgmq-js/tree/main/packages/pgmq-js
[main-svg]: https://img.shields.io/npm/v/@waiting/pgmq-js.svg?maxAge=7200
[main-ch]: https://github.com/waitingsong/pgmq-js/tree/main/packages/pgmq-js/CHANGELOG.md


[`@mwcp/pgmq-js`]: https://github.com/waitingsong/pgmq-js/tree/main/packages/mwcp-pgmq-js
[cli-svg]: https://img.shields.io/npm/v/@mwcp/pgmq-js.svg?maxAge=7200
[cli-ch]: https://github.com/waitingsong/pgmq-js/tree/main/packages/mwcp-pgmq-js/CHANGELOG.md

[Midway.js]: https://midwayjs.org/
