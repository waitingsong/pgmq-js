import assert from 'node:assert'

import { camelToSnake } from '@waiting/shared-core'

import type { Knex, QueryResponse, Transaction } from '../knex.types.js'
import type { QueueMetaManager } from '../queue-meta-manager/queue-meta-manager.js'
import type { ListQueueMetaOptions, QueueId } from '../queue-meta-manager/queue-meta.types.js'

import type { RouteDo } from './db.types.js'
import { matchQueueKey, parseRoute } from './router.helpers.js'
import { RouteSql } from './router.sql.js'
import type {
  CreateRouteMatchOptions,
  DeleteRouteOptions,
  GetAllRouteOptions, GetRouteOptions,
  RouteDto, RouteId, RouteOptionsBase,
  CreateRouteOptions,
} from './router.types.js'


export class Router {

  constructor(
    protected readonly dbh: Knex,
    protected readonly queueMetaManager: QueueMetaManager,
  ) { }

  async count(options: RouteOptionsBase): Promise<bigint> {
    const { trx } = options
    const sql = RouteSql.count
    const res = await this.execute<QueryResponse<{ count: string }>>(sql, null, trx)
    const ret = res.rows[0]?.count ?? 0
    return BigInt(ret)
  }

  async create(options: CreateRouteOptions): Promise<RouteId> {
    const { routeName, queueIds, json } = options
    const sql = RouteSql.save

    const uniqueQueueIds = new Set(queueIds)
    const trx = options.trx ?? await this.dbh.transaction()
    const { rows } = await this.execute<QueryResponse<{ route_id: RouteId }>>(
      sql,
      [routeName.toLowerCase(), Array.from(uniqueQueueIds), json ?? null],
      trx,
    )
    assert(rows[0])
    const routeId = rows[0].route_id
    if (! options.trx) {
      await trx.commit()
    }
    return routeId
  }

  async createMatch(options: CreateRouteMatchOptions): Promise<RouteId> {
    const { routeName, routeRules, json, limit } = options
    assert(routeRules.length > 0, 'parameter routeRules is empty')
    const limitDefault = 1000
    const trx = options.trx ?? await this.dbh.transaction()

    const matchQueueIds = await this.retrieveQueueIds(routeRules, limit ?? limitDefault, trx)
    assert(matchQueueIds.size > 0, 'no queue matched')

    const routeId = await this.create({
      routeName,
      queueIds: Array.from(matchQueueIds),
      json: json ?? null,
      trx,
    })

    if (! options.trx) {
      await trx.commit()
    }
    return routeId
  }

  async list(options: GetAllRouteOptions): Promise<RouteDto[]> {
    const { trx } = options

    const limit = options.limit ?? 100
    const orderBy = options.orderBy ?? 'route_id'
    const order = options.order ?? 'asc'
    // const where = null

    const res = await this.execute2<RouteDo[]>(trx, { limit, orderBy, order })
    const ret = res.map(parseRoute)
    return ret
  }

  getOne(options: GetRouteOptions): Promise<RouteDto | null> {
    if (options.routeId) {
      return this.getById(options)
    }
    return this.getByName(options)
  }

  protected async getById(options: GetRouteOptions): Promise<RouteDto | null> {
    const { routeId, trx } = options
    assert(routeId, 'parameter routeId is empty')

    const sql = RouteSql.getById
    const res = await this.execute<QueryResponse<RouteDo>>(sql, [routeId], trx)
    const ret = res.rows[0] ? parseRoute(res.rows[0]) : null
    return ret
  }

  protected async getByName(options: GetRouteOptions): Promise<RouteDto | null> {
    const { routeName, trx } = options
    assert(routeName, 'parameter routeName is empty')

    const sql = RouteSql.getByName
    const res = await this.execute<QueryResponse<RouteDo>>(sql, [routeName], trx)
    const ret = res.rows[0] ? parseRoute(res.rows[0]) : null
    return ret
  }

  async getAll(options: GetAllRouteOptions): Promise<RouteDto[]> {
    const { trx } = options

    const limit = options.limit ?? 100
    const orderBy = options.orderBy ?? 'route_id'
    const order = options.order ?? 'asc'
    const res = await this.execute2<RouteDo[]>(trx, { limit, orderBy, order })
    const ret = res.map(parseRoute)
    return ret
  }

  async delete(options: DeleteRouteOptions): Promise<void> {
    const { routeId, trx } = options
    const sql = RouteSql.deleteById
    await this.execute<QueryResponse<RouteDo>>(sql, [routeId], trx)
  }

  async truncate(options?: RouteOptionsBase): Promise<void> {
    const sql = RouteSql.truncate
    await this.execute(sql, null, options?.trx)
  }

  protected async execute<T = unknown>(sql: string, params: unknown[] | null, trx: Transaction | undefined | null): Promise<T> {
    if (trx) {
      assert(! trx.isCompleted(), 'parameter trx is completed already')
    }

    const dbh = trx ?? this.dbh
    try {
      const query = params ? dbh.raw(sql, params) : dbh.raw(sql)
      const res = await query as T
      return res
    }
    catch (ex) {
      await trx?.rollback()
      throw ex
    }
  }

  protected async execute2<T = unknown>(
    trx: Transaction | undefined | null,
    extra?: ExtraQuery,
  ): Promise<T> {

    if (trx) {
      assert(! trx.isCompleted(), 'parameter trx is completed already')
    }

    const dbh = trx ?? this.dbh
    try {
      const query = dbh('pgmq.tb_route').select('*')
      if (extra?.limit) {
        void query.limit(extra.limit)
      }
      if (extra?.orderBy) {
        void query.orderBy(camelToSnake(extra.orderBy), camelToSnake(extra.order ?? 'asc'))
      }
      // if (extra?.where) {
      //   void query.whereRaw(extra.where)
      // }

      const res = await query as T
      return res
    }
    catch (ex) {
      await trx?.rollback()
      throw ex
    }
  }

  // #region retrieveQueueIds

  private async retrieveQueueIds(
    routeRules: CreateRouteMatchOptions['routeRules'],
    limit: number,
    trx: Transaction | null | undefined,
  ): Promise<Set<QueueId>> {

    assert(routeRules.length > 0, 'parameter routeRules is empty')

    let startQueueId = 0n
    const [matchQueueIds, greatThenQueueId] = await this._retrieveQueueIds(routeRules, limit, trx, startQueueId)
    const { size } = matchQueueIds
    if (size >= limit) {
      return matchQueueIds
    }

    startQueueId = greatThenQueueId
    let rest = limit - size
    while (rest > 0) {
      const [matchQueueIds2, greatThenQueueId2] = await this._retrieveQueueIds(routeRules, rest, trx, startQueueId)
      if (greatThenQueueId2 === 0n) { break } // no more queue

      matchQueueIds2.forEach((id) => {
        rest = limit - matchQueueIds.size
        if (rest === 0) { return }
        matchQueueIds.add(id)
      })
      startQueueId = greatThenQueueId2
    }

    return matchQueueIds
  }

  private async _retrieveQueueIds(
    routeRules: CreateRouteMatchOptions['routeRules'],
    limit: number,
    trx: Transaction | null | undefined,
    startQueueId = 0n,
  ): Promise<[Set<QueueId>, bigint]> {

    assert(routeRules.length > 0, 'parameter routeRules is empty')

    const matchQueueIds = new Set<QueueId>()
    let lessThenQueueId = startQueueId
    const limit2 = limit > 10 ? limit : 100

    const listOpts: ListQueueMetaOptions = { limit: limit2, relativeQueueId: lessThenQueueId, order: 'desc', trx }
    const queues = await this.queueMetaManager.list(listOpts)
    if (queues.length === 0) {
      return [matchQueueIds, 0n]
    }

    queues.forEach((qu) => {
      if (matchQueueIds.size >= limit) { return }
      if (BigInt(qu.queueId) < lessThenQueueId || lessThenQueueId === 0n) {
        lessThenQueueId = BigInt(qu.queueId)
      }

      const match = matchQueueKey(qu.queue, qu.queueKey, routeRules)
      if (match) {
        matchQueueIds.add(qu.queueId)
      }
    })

    return [matchQueueIds, lessThenQueueId]
  }


}

interface ExtraQuery {
  limit?: number
  // where?: string | null
  orderBy?: string
  order?: 'asc' | 'desc'
}
