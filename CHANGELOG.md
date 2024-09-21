# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
