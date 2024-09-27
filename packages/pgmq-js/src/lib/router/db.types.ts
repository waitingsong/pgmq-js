/* c8 ignore start */

import type { RouteId } from './router.types.js'


export interface RouteDo {
  route_id: RouteId
  route_name: string
  queue_ids: string[]
  json: object | null
  ctime: Date
  mtime: Date | null
}


/* c8 ignore stop */
