
export enum QueueMsg {
  create = '新建队列',
  createUnlogged = '新建无日志队列',
  hasQueue = '队列是否存在',
  getOne = '获取指定队列信息',
  list = '获取队列列表',
  drop = '删除队列',
  purge = '清空队列, 返回清空的消息数',
  detachArchive = '分离归档',
  metrics = '队列指标',
  metricsAll = '所有队列指标',
}


