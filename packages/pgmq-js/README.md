# @waiting/pgmq-js repository

Postgres Message Queue (PGMQ) JavaScript Client Library


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
npm i @waiting/pgmq-js
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

## Usage

```ts
import { Pgmq, type DbConnectionConfig, type Message, type MsgId } from '@waiting/pgmq-js'

const connection: DbConnectionConfig  = {
  host: process.env['POSTGRES_HOST'] ? process.env['POSTGRES_HOST'] : 'localhost',
  port: process.env['POSTGRES_PORT'] ? +process.env['POSTGRES_PORT'] : 5432,
  database: process.env['POSTGRES_DB'] ? process.env['POSTGRES_DB'] : 'postgres',
  user: process.env['POSTGRES_USER'] ? process.env['POSTGRES_USER'] : 'postgres',
  password: process.env['POSTGRES_PASSWORD'] ? process.env['POSTGRES_PASSWORD'] : 'password',
  statement_timeout: 6000, // in milliseconds
}

const pgmq = new Pgmq('mq1', { connection })

const qName = 'my_queue';
await pgmq.queue.create(qName)

const msgToSend = { id: 1, name: 'testMsg' }

const msgId: MsgId = await pgmq.msg.send(qName, msgToSend )
const msgIds: MsgId[] = await pgmq.msg.sendBatch(qName, [msgToSend , msgToSend ])

const vt = 3 // Time in seconds that the message become invisible after reading, defaults to 0
const msg: Message = await pgmq.msg.read<Msg>(qName, vt)

const numMessages = 5 // The number of messages to read from the queue, defaults to 10
const msgs: Message[] = await pgmq.msg.readBatch<Msg>(qName, vt, numMessages)

await pgmq.msg.archive(qName, msg.msgId)
```

[More Examples](https://github.com/waitingsong/pgmq-js/tree/main/packages/pgmq-js/test/lib)


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

