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


以下所有命令行操作都在 `git-bash` 窗口中执行

## Install global deps for development
```sh
npm i -g c8 lerna madge rollup tsx zx
```


## Packages

| Package        | Version                |
| -------------- | ---------------------- |
| [`pgmq-js`]    | [![main-svg]][main-ch] |
| [`@mwcp/pgmq`] | [![cli-svg]][cli-ch]   |


## Installation

```sh
npm i @waiting/pgmq-js
// or for midway.js
npm i @mwcp/pgmq
```

## Prepare

Start a Postgres instance with the PGMQ extension installed:

```sh
docker run -d --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 quay.io/tembo/pg17-pgmq:latest
```

Create the pgmq extension
```sh
psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U$POSTGRES_USER -d $POSTGRES_DB -bq \
  -f packages/pgmq-js/database/default/ddl/extension.sql \
  -f packages/pgmq-js/database/default/ddl/tb_queue_meta.sql \
  -f packages/pgmq-js/database/default/ddl/tb_route.sql 
```


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
[main-svg]: https://img.shields.io/npm/v/@waiting/pgmq-js.svg?maxAge=300
[main-ch]: https://github.com/waitingsong/pgmq-js/tree/main/packages/pgmq-js/CHANGELOG.md


[`@mwcp/pgmq`]: https://github.com/waitingsong/pgmq-js/tree/main/packages/mwcp-pgmq-js
[cli-svg]: https://img.shields.io/npm/v/@mwcp/pgmq.svg?maxAge=300
[cli-ch]: https://github.com/waitingsong/pgmq-js/tree/main/packages/mwcp-pgmq-js/CHANGELOG.md

[PGMQ]: https://tembo-io.github.io/pgmq/

