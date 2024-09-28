/* c8 ignore start */
import type { Transaction } from '../knex.types.js'
import type { QueueId } from '../queue-meta-manager/queue-meta.types.js'


export type RouteId = string // bigint as string

export interface RouteDto {
  routeId: RouteId
  /**
   * Maximum 512 characters
   */
  routeName: string
  queueIds: QueueId[]
  json: object | null
  ctime: string
  mtime: string | null
}

export interface RouteOptionsBase {
  trx?: Transaction | undefined | null
}

/**
 * Get route by routeId or routeName,
 * if both are provided, routeId is used,
 * if none is provided, throw error
 */
export interface GetRouteOptions extends RouteOptionsBase {
  routeId?: RouteId
  routeName?: string
}

export interface GetAllRouteOptions extends RouteOptionsBase {
  /**
   * Maximum get number records
   * @@default 100
   */
  limit?: number
  /**
   * @default routeId
   */
  orderBy?: 'routeId' | 'routeName' | 'ctime' | 'mtime'
  /**
   * @default asc
   */
  order?: 'asc' | 'desc'
}

export interface CreateRouteOptions extends RouteOptionsBase {
  /**
   * Maximum 512 characters
   */
  routeName: string
  queueIds: QueueId[]
  json?: object | null
}

export interface CreateRouteMatchOptions extends RouteOptionsBase {
  /**
   * Maximum 512 characters
   */
  routeName: string
  /**
   * Bind queues matching this routeRules to this route
   * - if needle is '*', return true
   * - match queue name with routeRules if queueKey is null
   * - match queueKey with routeRules
   */
  routeRules: RouteRules[] | '*'
  /**
   * Maximum queues to bind
   * @default 1000
   */
  limit?: number
  json?: object | null
}

export interface DeleteRouteOptions extends RouteOptionsBase {
  routeId: RouteId
}

/**
 * Route rules to match the queue name or queue key
 */
export type RouteRules = string | RegExp


export interface UpdateRouteOptions extends RouteOptionsBase {
  /**
   * Maximum 512 characters
   */
  routeName: string
  queueIds: QueueId[]
  json?: object | null
}

/* c8 ignore stop */
