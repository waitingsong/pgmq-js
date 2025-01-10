# pgmq-js

Postgres Message Queue ([PGMQ]) JavaScript Client Library, 
supports Transaction,
supports Route routing to implement the `Exchange` functionality of the MQ queue.


[![GitHub tag](https://img.shields.io/github/tag/waitingsong/pgmq-js.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![](https://img.shields.io/badge/lang-TypeScript-blue.svg)]()
[![ci](https://github.com/waitingsong/pgmq-js/actions/workflows/nodejs.yml/badge.svg
)](https://github.com/waitingsong/pgmq-js/actions)
[![codecov](https://codecov.io/gh/waitingsong/pgmq-js/graph/badge.svg?token=RSoBwfxEGn)](https://codecov.io/gh/waitingsong/pgmq-js)


Tested with
- [PGMQ] v1.5.0

## Installation

```sh
npm i @waiting/pgmq-js
```

## Prepare

Start a Postgres instance with the PGMQ extension installed:

```sh
docker run -d --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 quay.io/tembo/pg17-pgmq:latest
```

Create the pgmq extension and necessary tables
```sh
psql -h $PGMQ_HOST -p $PGMQ_PORT -U$PGMQ_USER -d $PGMQ_DB -bq \
  -f database/default/ddl/extension.sql \
  -f database/default/ddl/tb_queue_meta.sql \
  -f database/default/ddl/tb_route.sql 
```

Enable [maintenance] on the database(s)
```sql
ALTER SYSTEM SET pg_partman_bgw.dbname = 'postgres,db_ci_test';
SELECT pg_reload_conf();
```

## Usage

### init
```ts
import { Pgmq, type DbConnectionConfig, type Message, type MsgId } from '@waiting/pgmq-js'

const connection: DbConnectionConfig  = {
  host: process.env['PGMQ_HOST'] ? process.env['PGMQ_HOST'] : 'localhost',
  port: process.env['PGMQ_PORT'] ? +process.env['PGMQ_PORT'] : 5432,
  database: process.env['PGMQ_DB'] ? process.env['PGMQ_DB'] : 'postgres',
  user: process.env['PGMQ_USER'] ? process.env['PGMQ_USER'] : 'postgres',
  password: process.env['PGMQ_PASSWORD'] ? process.env['PGMQ_PASSWORD'] : 'password',
  statement_timeout: 6000, // in milliseconds
}
```

### Crate Queue and Send Message

```ts
const pgmq = new Pgmq('mq1', { connection })

const queue = 'my_queue';
await pgmq.queue.create({ queue })

const msgToSend = { id: 1, name: 'testMsg' }

const msgId: MsgId = await pgmq.sendMsg({ queue, msg: msgToSend }) // equal to pgmq.msg.send()
const msgId: MsgId = await pgmq.msg.send({ queue, msg: msgToSend })

const msgIds: MsgId[] = await pgmq.msg.sendBatch({ queue, msg: [msgToSend , msgToSend ]})

const vt = 3 // Time in seconds that the message become invisible after reading, defaults to 0
const msg: Message = await pgmq.msg.read<typeof msgToSend>({ queue, vt })

// Filters the messages by their json content. Defaults to '{}' - no filtering
const msg: Message = await pgmq.msg.read<typeof msgToSend>({ queue, vt, conditional: { id: 1 } })

const numMessages = 5 // The number of messages to read from the queue, defaults to 10
const msgs: Message[] = await pgmq.msg.readBatch({ queue, vt, numMessages })

await pgmq.msg.archive({ queue, msgId: msg.msgId })

```

### Transaction

```ts
const trx = await mq.startTransaction() // start a transaction

const queue = 'my_queue';
await pgmq.queue.create({ queue, trx })

const msgToSend = { id: 1, name: 'testMsg' }

const msgId: MsgId = await pgmq.msg.send({ queue, msg: msgToSend, trx })
const msgIds: MsgId[] = await pgmq.msg.sendBatch({ queue, msg: [msgToSend , msgToSend ], trx})

const vt = 3 // Time in seconds that the message become invisible after reading, defaults to 0
const msg: Message = await pgmq.msg.read({ queue, vt, trx })

const numMessages = 5 // The number of messages to read from the queue, defaults to 10
const msgs: Message[] = await pgmq.msg.readBatch<typeof msgToSend>({ queue, vt, numMessages, trx })

await pgmq.msg.archive({ queue, msgId: msg.msgId, trx })

await trx.commit() // commit transaction
```

### Create Route and send RouteMsg

#### Create Route

Matching all by `*`
```ts
const createOpts: CreateRouteMatchOptions = { routeName: 'foo', routeRules: '*' } // default limit 1000
const routeId = await mq.router.createMatch(createOpts)
assert(BigInt(routeId) > 0n, 'createMatch() failed')
```

Exact string matching 
```ts
const createOpts: CreateRouteMatchOptions = { routeName: 'foo', routeRules: ['order'] } // default limit 1000
const routeId = await mq.router.createMatch(createOpts)
```

Matching by Regex
```ts
const createOpts: CreateRouteMatchOptions = { routeName: 'foo', routeRules: [/^order.*/u] } // default limit 1000
const routeId = await mq.router.createMatch(createOpts)
```

#### Send RouteMsg

```ts
const msg = { hello: 'foo' }
const opts: SendRouteMsgOptions = { routeName: 'foo', msg }
const result: SendRouteMsgResultItem[] = await mq.sendRouteMsg(opts)
/*
interface SendRouteMsgResultItem {
  msgId: MsgId
  routeId: RouteId
  routeName: string
  queueId: QueueId
  queue: string
}
*/
```


[More Examples](https://github.com/waitingsong/pgmq-js/tree/main/packages/pgmq-js/test/)


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
- [x] [Queue Management](https://tembo-io.github.io/pgmq/api/sql/functions/#queue-management)
  - [x] [create](https://tembo-io.github.io/pgmq/api/sql/functions/#create)
  - [x] [create_partitioned](https://tembo-io.github.io/pgmq/api/sql/functions/#create_partitioned) see `Partition` 
  - [x] [create_unlogged](https://tembo-io.github.io/pgmq/api/sql/functions/#create_unlogged)
  - [x] [detach_archive](https://tembo-io.github.io/pgmq/api/sql/functions/#detach_archive)
  - [x] [drop_queue](https://tembo-io.github.io/pgmq/api/sql/functions/#drop_queue)
- [x] [Utilities](https://tembo-io.github.io/pgmq/api/sql/functions/#utilities)
  - [x] [set_vt](https://tembo-io.github.io/pgmq/api/sql/functions/#set_vt)
  - [x] [list_queues](https://tembo-io.github.io/pgmq/api/sql/functions/#list_queues)
  - [x] [metrics](https://tembo-io.github.io/pgmq/api/sql/functions/#metrics)
  - [x] [metrics_all](https://tembo-io.github.io/pgmq/api/sql/functions/#metrics_all)
- Partition
  - [x] [create_partitioned](https://tembo-io.github.io/pgmq/api/sql/functions/#create_partitioned)
  - [x] [show_partitions](https://github.com/pgpartman/pg_partman/blob/development/doc/pg_partman.md#show_partitions)
  - [x] [run_maintenance](https://github.com/pgpartman/pg_partman/blob/development/doc/pg_partman.md#run_maintenance)


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

[PGMQ]: https://tembo-io.github.io/pgmq/
[maintenance]: https://github.com/pgpartman/pg_partman/blob/development/doc/pg_partman.md#run_maintenance
