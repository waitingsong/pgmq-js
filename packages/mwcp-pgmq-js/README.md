# Midway.js [PGMQ] Component

Postgres Message Queue (PGMQ) Component for [Midway.js]


[![GitHub tag](https://img.shields.io/github/tag/waitingsong/pgmq-js.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![](https://img.shields.io/badge/lang-TypeScript-blue.svg)]()
[![ci](https://github.com/waitingsong/pgmq-js/actions/workflows/nodejs.yml/badge.svg
)](https://github.com/waitingsong/pgmq-js/actions)
[![codecov](https://codecov.io/gh/waitingsong/pgmq-js/graph/badge.svg?token=RSoBwfxEGn)](https://codecov.io/gh/waitingsong/pgmq-js)


## Installation

```sh
npm i @mwcp/pgmq
```

## Prepare

Start a Postgres instance with the PGMQ extension installed:

```sh
docker run -d --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 quay.io/tembo/pg16-pgmq:latest
```

Create the pgmq extension
```sh
psql -h $PGMQ_HOST -p $PGMQ_PORT -U$PGMQ_USER -d $PGMQ_DB -bq \
  -f packages/pgmq-js/database/default/ddl/extension.sql
```


## Configuration

Update project `src/configuration.ts`
```ts
import { Configuration } from '@midwayjs/core'
import * as pgmq from '@mwcp/pgmq'

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
    return this.msg.send(options)
  }
}

```


### Consumer Decorator

```ts
import assert from 'node:assert'
import { Singleton } from '@midwayjs/core'
import { Consumer, ConsumerMessageDto, PgmqListener } from '@mwcp/pgmq'

@Consumer()
@Singleton()
export class DemoConsumerService {

  readonly msgs1: ConsumerMessageDto[] = []
  readonly msgs2: ConsumerMessageDto[] = []
  readonly msgs3: ConsumerMessageDto[] = []

  @PgmqListener({ queue: 'q1' }) // default consumeAction is 'delete'
  @PgmqListener({ queue: ['q2', 'q3'], consumeAction: 'archive' })
  async hello(msg: ConsumerMessageDto): Promise<void> {
    switch (msg.queue) {
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


[`@mwcp/pgmq`]: https://github.com/waitingsong/pgmq-js/tree/main/packages/mwcp-pgmq-js
[cli-svg]: https://img.shields.io/npm/v/@mwcp/pgmq.svg?maxAge=7200
[cli-ch]: https://github.com/waitingsong/pgmq-js/tree/main/packages/mwcp-pgmq-js/CHANGELOG.md

[Midway.js]: https://midwayjs.org/
[PGMQ]: https://tembo-io.github.io/pgmq/

