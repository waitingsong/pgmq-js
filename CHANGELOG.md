# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [6.9.0](https://github.com/waitingsong/pgmq-js/compare/v6.8.1...v6.9.0) (2025-01-15)


### Features

* **pgmq:** add Pgmq.tableExists() ([8a4954d](https://github.com/waitingsong/pgmq-js/commit/8a4954dfea2431c292c2921cddd0cffe19ae280a))





## [6.8.1](https://github.com/waitingsong/pgmq-js/compare/v6.8.0...v6.8.1) (2025-01-12)


### Bug Fixes

* **pgmq:** case conversion use timestamptz instead of timestamp ([8b0f1d4](https://github.com/waitingsong/pgmq-js/commit/8b0f1d4a3bad40adce965931d5b0e1fb28a7561d))





# [6.8.0](https://github.com/waitingsong/pgmq-js/compare/v6.7.0...v6.8.0) (2025-01-10)


### Features

* **pgmq:** Partition Class ([b50dc6d](https://github.com/waitingsong/pgmq-js/commit/b50dc6dcabf6e8986e12687400c4cb69613893d1))





# [6.7.0](https://github.com/waitingsong/pgmq-js/compare/v6.6.1...v6.7.0) (2025-01-09)


### Features

* **mwcp:** update MessageDto ([b931d3d](https://github.com/waitingsong/pgmq-js/commit/b931d3d0d378828a3014a20acc674dcf36b45ca1))
* **pgmq:** supports headers for pgmq v1.5.0 ([adc36da](https://github.com/waitingsong/pgmq-js/commit/adc36da5ccbfc991e854c4860f0b1d20ad177108))





## [6.6.1](https://github.com/waitingsong/pgmq-js/compare/v6.6.0...v6.6.1) (2025-01-07)

**Note:** Version bump only for package pgmq-js





# [6.6.0](https://github.com/waitingsong/pgmq-js/compare/v6.5.1...v6.6.0) (2024-12-19)


### Features

* **pgmq:** add new conditional parameter for read and readBatch ([244b81b](https://github.com/waitingsong/pgmq-js/commit/244b81ba6da84797b05e4af15fd7d5aeedce9908))
* **pgmq:** add Pgmq.getTimestamp(delay?) ([63e68b5](https://github.com/waitingsong/pgmq-js/commit/63e68b56418945abf2ffcfefee1fa7d720d0397b))
* **pgmq:** add timestamp support in send ([2fda2b3](https://github.com/waitingsong/pgmq-js/commit/2fda2b3b40f2c1219deb8996b40f97019344b09e))
* **pgmq:** add timestamp support in send_batch ([88720b6](https://github.com/waitingsong/pgmq-js/commit/88720b69c4e36efeed28b7fd8d5ac467b0b2d504))





## [6.5.1](https://github.com/waitingsong/pgmq-js/compare/v6.5.0...v6.5.1) (2024-12-19)

**Note:** Version bump only for package pgmq-js





# [6.5.0](https://github.com/waitingsong/pgmq-js/compare/v6.4.6...v6.5.0) (2024-11-22)

**Note:** Version bump only for package pgmq-js





## [6.4.6](https://github.com/waitingsong/pgmq-js/compare/v6.4.5...v6.4.6) (2024-10-30)

**Note:** Version bump only for package pgmq-js





## [6.4.5](https://github.com/waitingsong/pgmq-js/compare/v6.4.4...v6.4.5) (2024-10-18)

**Note:** Version bump only for package pgmq-js





## [6.4.4](https://github.com/waitingsong/pgmq-js/compare/v6.4.3...v6.4.4) (2024-10-18)

**Note:** Version bump only for package pgmq-js





## [6.4.3](https://github.com/waitingsong/pgmq-js/compare/v6.4.2...v6.4.3) (2024-10-18)

**Note:** Version bump only for package pgmq-js





## [6.4.2](https://github.com/waitingsong/pgmq-js/compare/v6.4.1...v6.4.2) (2024-10-16)

**Note:** Version bump only for package pgmq-js





## [6.4.1](https://github.com/waitingsong/pgmq-js/compare/v6.4.0...v6.4.1) (2024-10-13)


### Bug Fixes

* **pgmq:** result length of genRandomName() ([c118bc8](https://github.com/waitingsong/pgmq-js/commit/c118bc86ca76d0f6b8ab0e86e7f937897018e80e))





# [6.4.0](https://github.com/waitingsong/pgmq-js/compare/v6.3.3...v6.4.0) (2024-10-11)


### Features

* **pgmq:** send() a message to queues without creating a route ([2756a8e](https://github.com/waitingsong/pgmq-js/commit/2756a8ef208f4c15d96eb249a986e93965077cf4))
* **pgmq:** sendBath() messages to queues without creating a route ([1e24b96](https://github.com/waitingsong/pgmq-js/commit/1e24b9692b8bbaa05398c523ce4cb78d2f6e1dd9))





## [6.3.3](https://github.com/waitingsong/pgmq-js/compare/v6.3.2...v6.3.3) (2024-10-10)

**Note:** Version bump only for package pgmq-js





## [6.3.2](https://github.com/waitingsong/pgmq-js/compare/v6.3.1...v6.3.2) (2024-09-29)

**Note:** Version bump only for package pgmq-js





## [6.3.1](https://github.com/waitingsong/pgmq-js/compare/v6.3.0...v6.3.1) (2024-09-29)

**Note:** Version bump only for package pgmq-js





# [6.3.0](https://github.com/waitingsong/pgmq-js/compare/v6.2.0...v6.3.0) (2024-09-29)


### Features

* **pgmq:** do not check trx completed ([4445cbb](https://github.com/waitingsong/pgmq-js/commit/4445cbbca93b6113595caa6c48d4a4e1b6473cf4))


### Performance Improvements

* **pgmq:** parallel send route msg with RouteMsg.sendConcurrentNumber ([99b9078](https://github.com/waitingsong/pgmq-js/commit/99b9078fb04123db6092732c55e29ecc6d32e303))





# [6.2.0](https://github.com/waitingsong/pgmq-js/compare/v6.1.0...v6.2.0) (2024-09-29)


### Features

* **pgmq:** update parameter type of create() and createUnlogged() of QueueManager ([369c564](https://github.com/waitingsong/pgmq-js/commit/369c5641376f0b341217e2d1d279a16adb485724))





# [6.1.0](https://github.com/waitingsong/pgmq-js/compare/v6.0.0...v6.1.0) (2024-09-28)


### Features

* **pgmq:** add Pgmq.sendMsg() ([d174f70](https://github.com/waitingsong/pgmq-js/commit/d174f70de8066ce231c7c5aa75423e3a5b01996e))





# [6.0.0](https://github.com/waitingsong/pgmq-js/compare/v5.0.2...v6.0.0) (2024-09-28)


### Features

* **mwcp:** breaking change parameters from pgmq and update types ([8231111](https://github.com/waitingsong/pgmq-js/commit/823111103b23b41582f52295dc5367ac8a701768))
* **pgmq:** add type OptionsBase ([472e13c](https://github.com/waitingsong/pgmq-js/commit/472e13c4634203ace596020f7efd0c3dc1c216c1))
* **pgmq:** breaking change parameter of methods of QueueManager ([f09d10e](https://github.com/waitingsong/pgmq-js/commit/f09d10e90391caa90d259911865d0683118558ad))
* **pgmq:** QueueManager.create() return QueueId (string) ([90efd75](https://github.com/waitingsong/pgmq-js/commit/90efd75d7878bdf3a400ce6f2530a7a33bfb710c))
* **pgmq:** route support with Router ([6ac173b](https://github.com/waitingsong/pgmq-js/commit/6ac173bb7435857f80d8fc90bdb6186737c7e49f))
* **pgmq:** RouteMsg ([f0507b7](https://github.com/waitingsong/pgmq-js/commit/f0507b7490ce9595095dd0a8c97414e4d2f986a0))
* **pgmq:** save extra queue meta with table `pqmq.tb_queue_meta` ([f743ed1](https://github.com/waitingsong/pgmq-js/commit/f743ed12c41df3baf7090f1ab8f08c8ed73ae7c6))





## [5.0.2](https://github.com/waitingsong/pgmq-js/compare/v5.0.1...v5.0.2) (2024-09-23)

**Note:** Version bump only for package pgmq-js





## [5.0.1](https://github.com/waitingsong/pgmq-js/compare/v5.0.0...v5.0.1) (2024-09-23)

**Note:** Version bump only for package pgmq-js





# [5.0.0](https://github.com/waitingsong/pgmq-js/compare/v4.0.0...v5.0.0) (2024-09-22)


### Features

* **mwcp:** use new parameter style of pgmq-js ([adec22a](https://github.com/waitingsong/pgmq-js/commit/adec22aba614c19647c2438a00dcb7733fa086e2))
* **pgmq:** breaking change parameter to single options of QueueManager methods ([5210ec6](https://github.com/waitingsong/pgmq-js/commit/5210ec69d5ea5712b1b82b595a61c92b5871146c))





# [4.0.0](https://github.com/waitingsong/pgmq-js/compare/v3.0.1...v4.0.0) (2024-09-21)


### Features

* **pgmq:** methods of MsgManager support pass transaction (except readWithPoll()) ([ad14a24](https://github.com/waitingsong/pgmq-js/commit/ad14a249c490bded6a5cd118a87d1c2237a5b04e))





## [3.0.1](https://github.com/waitingsong/pgmq-js/compare/v3.0.0...v3.0.1) (2024-09-21)

**Note:** Version bump only for package pgmq-js





# [3.0.0](https://github.com/waitingsong/pgmq-js/compare/v2.2.0...v3.0.0) (2024-09-21)


### Features

* **mwcp:** breaking change property MsgSetVtDto['vtOffset'] to MsgSetVtDto['vt'} ([85bdbec](https://github.com/waitingsong/pgmq-js/commit/85bdbec2f0886a55f39c7ba027e3e0ac6b796bb9))
* **mwcp:** breaking change rename property  queueName to queue of QueueMetricsDto, ConsumerMessageDto ([3aca14d](https://github.com/waitingsong/pgmq-js/commit/3aca14d81326346cf305f3e23443407d5ff2464a))
* **pgmq:** breaking change rename property  queueName to queue of QueueMetrics, QueueMetricsDto ([8b69a98](https://github.com/waitingsong/pgmq-js/commit/8b69a98210f192275bbb1a964b3cddd04ac8daab))
* use prefix PGMQ_ as env variable name instead of POSTGRES_ ([1aaff5b](https://github.com/waitingsong/pgmq-js/commit/1aaff5bac3476bc1c44a98c61677431c800fa41b))





# [2.2.0](https://github.com/waitingsong/pgmq-js/compare/v2.1.5...v2.2.0) (2024-09-21)


### Features

* **pgmq:** queue name accepts hyphen - with new version of pgmq v1.4.4 ([476a059](https://github.com/waitingsong/pgmq-js/commit/476a059a8847c86cf2f1bc62e58c87ce2212a55e))





## [2.1.5](https://github.com/waitingsong/pgmq-js/compare/v2.1.4...v2.1.5) (2024-09-18)

**Note:** Version bump only for package pgmq-js





## [2.1.4](https://github.com/waitingsong/pgmq-js/compare/v2.1.3...v2.1.4) (2024-09-16)

**Note:** Version bump only for package pgmq-js





## [2.1.3](https://github.com/waitingsong/pgmq-js/compare/v2.1.2...v2.1.3) (2024-09-05)

**Note:** Version bump only for package pgmq-js





## [2.1.2](https://github.com/waitingsong/pgmq-js/compare/v2.1.1...v2.1.2) (2024-08-27)

**Note:** Version bump only for package pgmq-js





## [2.1.1](https://github.com/waitingsong/pgmq-js/compare/v2.1.0...v2.1.1) (2024-08-25)

**Note:** Version bump only for package pgmq-js





# [2.1.0](https://github.com/waitingsong/pgmq-js/compare/v2.0.2...v2.1.0) (2024-08-25)


### Features

* **mwcp:** expose type DbConfig ([9aa0ff9](https://github.com/waitingsong/pgmq-js/commit/9aa0ff99b26a665aa583318c791556be258f0dad))





## [2.0.2](https://github.com/waitingsong/pgmq-js/compare/v2.0.1...v2.0.2) (2024-08-24)

**Note:** Version bump only for package pgmq-js





## [2.0.1](https://github.com/waitingsong/pgmq-js/compare/v2.0.0...v2.0.1) (2024-08-24)

**Note:** Version bump only for package pgmq-js





# [2.0.0](https://github.com/waitingsong/pgmq-js/compare/v1.3.3...v2.0.0) (2024-08-23)


### Features

* **mwcp:** break change api url to snake style ([0ddbab2](https://github.com/waitingsong/pgmq-js/commit/0ddbab24de962004e20cd749425d0bf9868ffc9f))
* **mwcp:** update config ConsumerOptions.autoCreateQueue, default true ([49a1188](https://github.com/waitingsong/pgmq-js/commit/49a118863082517addeb0c3c0958556740f31df2))
* **pgmq:** update QueueManager.hasQueue() ([0f82238](https://github.com/waitingsong/pgmq-js/commit/0f822384bde762130aa850d9f65a7c10cc2a815c))





## [1.3.3](https://github.com/waitingsong/pgmq-js/compare/v1.3.2...v1.3.3) (2024-08-23)

**Note:** Version bump only for package pgmq-js





## [1.3.2](https://github.com/waitingsong/pgmq-js/compare/v1.3.1...v1.3.2) (2024-08-22)

**Note:** Version bump only for package pgmq-js





## [1.3.1](https://github.com/waitingsong/pgmq-js/compare/v1.3.0...v1.3.1) (2024-08-22)

**Note:** Version bump only for package pgmq-js





# [1.3.0](https://github.com/waitingsong/pgmq-js/compare/v1.2.0...v1.3.0) (2024-08-22)


### Features

* consumer decorator `Consumer()` and `PgmqListener()` ([f2b6170](https://github.com/waitingsong/pgmq-js/commit/f2b61702524f595c59f88d9f5cf3df45c1f0f423))





# [1.2.0](https://github.com/waitingsong/pgmq-js/compare/v1.1.0...v1.2.0) (2024-08-22)


### Bug Fixes

* **pgmq-js:** result of list may undefined ([77e1d4b](https://github.com/waitingsong/pgmq-js/commit/77e1d4bd8182545df51348ff6a6af6a1e2f8b5f3))


### Features

* **pgmq:** add genRandomName() ([ab886aa](https://github.com/waitingsong/pgmq-js/commit/ab886aab02f3acb7dc8e11892b79feb643511af0))





# [1.1.0](https://github.com/waitingsong/pgmq-js/compare/v1.0.0...v1.1.0) (2024-08-18)


### Bug Fixes

* **mwcp:** package.json scripts ([9cc9a8c](https://github.com/waitingsong/pgmq-js/commit/9cc9a8c3b829799bd0b7ff6b941db08e110941fd))


### Features

* **mwcp:** implementation ([fe82f62](https://github.com/waitingsong/pgmq-js/commit/fe82f629a987363e9212893b324cf24bfc5a301c))
* **pgmq:** update types date properties of Message, Queue. add types ([0de8ee7](https://github.com/waitingsong/pgmq-js/commit/0de8ee726583fa8fe2a356c4caeab2b5843e8c69))





# 1.0.0 (2024-08-17)


### Features

* **mwcp:** implementation ([92ab065](https://github.com/waitingsong/pgmq-js/commit/92ab065a27496bd2a6a7b8f35d4ddac502ec75e3))
* **pgmq:** implementation ([fb49a26](https://github.com/waitingsong/pgmq-js/commit/fb49a267cdb63152d16c29305d1a6a3da5a60a35))
