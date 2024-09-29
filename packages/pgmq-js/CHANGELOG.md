# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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

* **pgmq:** add type OptionsBase ([472e13c](https://github.com/waitingsong/pgmq-js/commit/472e13c4634203ace596020f7efd0c3dc1c216c1))
* **pgmq:** breaking change parameter of methods of QueueManager ([f09d10e](https://github.com/waitingsong/pgmq-js/commit/f09d10e90391caa90d259911865d0683118558ad))
* **pgmq:** QueueManager.create() return QueueId (string) ([90efd75](https://github.com/waitingsong/pgmq-js/commit/90efd75d7878bdf3a400ce6f2530a7a33bfb710c))
* **pgmq:** route support with Router ([6ac173b](https://github.com/waitingsong/pgmq-js/commit/6ac173bb7435857f80d8fc90bdb6186737c7e49f))
* **pgmq:** RouteMsg ([f0507b7](https://github.com/waitingsong/pgmq-js/commit/f0507b7490ce9595095dd0a8c97414e4d2f986a0))
* **pgmq:** save extra queue meta with table `pqmq.tb_queue_meta` ([f743ed1](https://github.com/waitingsong/pgmq-js/commit/f743ed12c41df3baf7090f1ab8f08c8ed73ae7c6))





## [5.0.2](https://github.com/waitingsong/pgmq-js/compare/v5.0.1...v5.0.2) (2024-09-23)

**Note:** Version bump only for package @waiting/pgmq-js





## [5.0.1](https://github.com/waitingsong/pgmq-js/compare/v5.0.0...v5.0.1) (2024-09-23)

**Note:** Version bump only for package @waiting/pgmq-js





# [5.0.0](https://github.com/waitingsong/pgmq-js/compare/v4.0.0...v5.0.0) (2024-09-22)


### Features

* **pgmq:** breaking change parameter to single options of QueueManager methods ([5210ec6](https://github.com/waitingsong/pgmq-js/commit/5210ec69d5ea5712b1b82b595a61c92b5871146c))





# [4.0.0](https://github.com/waitingsong/pgmq-js/compare/v3.0.1...v4.0.0) (2024-09-21)


### Features

* **pgmq:** methods of MsgManager support pass transaction (except readWithPoll()) ([ad14a24](https://github.com/waitingsong/pgmq-js/commit/ad14a249c490bded6a5cd118a87d1c2237a5b04e))





## [3.0.1](https://github.com/waitingsong/pgmq-js/compare/v3.0.0...v3.0.1) (2024-09-21)

**Note:** Version bump only for package @waiting/pgmq-js





# [3.0.0](https://github.com/waitingsong/pgmq-js/compare/v2.2.0...v3.0.0) (2024-09-21)


### Features

* **pgmq:** breaking change rename property  queueName to queue of QueueMetrics, QueueMetricsDto ([8b69a98](https://github.com/waitingsong/pgmq-js/commit/8b69a98210f192275bbb1a964b3cddd04ac8daab))
* use prefix PGMQ_ as env variable name instead of POSTGRES_ ([1aaff5b](https://github.com/waitingsong/pgmq-js/commit/1aaff5bac3476bc1c44a98c61677431c800fa41b))





# [2.2.0](https://github.com/waitingsong/pgmq-js/compare/v2.1.5...v2.2.0) (2024-09-21)


### Features

* **pgmq:** queue name accepts hyphen - with new version of pgmq v1.4.4 ([476a059](https://github.com/waitingsong/pgmq-js/commit/476a059a8847c86cf2f1bc62e58c87ce2212a55e))





## [2.1.5](https://github.com/waitingsong/pgmq-js/compare/v2.1.4...v2.1.5) (2024-09-18)

**Note:** Version bump only for package @waiting/pgmq-js





## [2.1.3](https://github.com/waitingsong/pgmq-js/compare/v2.1.2...v2.1.3) (2024-09-05)

**Note:** Version bump only for package @waiting/pgmq-js





## [2.1.2](https://github.com/waitingsong/pgmq-js/compare/v2.1.1...v2.1.2) (2024-08-27)

**Note:** Version bump only for package @waiting/pgmq-js





## [2.0.1](https://github.com/waitingsong/pgmq-js/compare/v2.0.0...v2.0.1) (2024-08-24)

**Note:** Version bump only for package @waiting/pgmq-js





# [2.0.0](https://github.com/waitingsong/pgmq-js/compare/v1.3.3...v2.0.0) (2024-08-23)


### Features

* **pgmq:** update QueueManager.hasQueue() ([0f82238](https://github.com/waitingsong/pgmq-js/commit/0f822384bde762130aa850d9f65a7c10cc2a815c))





## [1.3.3](https://github.com/waitingsong/pgmq-js/compare/v1.3.2...v1.3.3) (2024-08-23)

**Note:** Version bump only for package @waiting/pgmq-js





## [1.3.2](https://github.com/waitingsong/pgmq-js/compare/v1.3.1...v1.3.2) (2024-08-22)

**Note:** Version bump only for package @waiting/pgmq-js





## [1.3.1](https://github.com/waitingsong/pgmq-js/compare/v1.3.0...v1.3.1) (2024-08-22)

**Note:** Version bump only for package @waiting/pgmq-js





# [1.2.0](https://github.com/waitingsong/pgmq-js/compare/v1.1.0...v1.2.0) (2024-08-22)


### Bug Fixes

* **pgmq-js:** result of list may undefined ([77e1d4b](https://github.com/waitingsong/pgmq-js/commit/77e1d4bd8182545df51348ff6a6af6a1e2f8b5f3))


### Features

* **pgmq:** add genRandomName() ([ab886aa](https://github.com/waitingsong/pgmq-js/commit/ab886aab02f3acb7dc8e11892b79feb643511af0))





# [1.1.0](https://github.com/waitingsong/pgmq-js/compare/v1.0.0...v1.1.0) (2024-08-18)


### Features

* **pgmq:** update types date properties of Message, Queue. add types ([0de8ee7](https://github.com/waitingsong/pgmq-js/commit/0de8ee726583fa8fe2a356c4caeab2b5843e8c69))





# 1.0.0 (2024-08-17)


### Features

* **pgmq:** implementation ([fb49a26](https://github.com/waitingsong/pgmq-js/commit/fb49a267cdb63152d16c29305d1a6a3da5a60a35))
