import assert from 'node:assert'

import type { RouteDo } from './db.types.js'
import type { CreateRouteMatchOptions, RouteDto } from './router.types.js'


export function parseRoute(input: RouteDo): RouteDto {
  const ret: RouteDto = {
    routeId: input.route_id,
    routeName: input.route_name,
    // queueIds: input.queue_ids.map(id => id.toString()),
    queueIds: input.queue_ids,
    json: input.json,
    ctime: input.ctime.toISOString(),
    mtime: input.mtime?.toISOString() ?? null,
  }
  return ret
}

/**
 * - if needle is '*', return true
 * - match queue name with routeRules if queueKey is null
 * - match queueKey with routeRules
 */
export function matchQueueKey(queue: string, queueKey: string | null, needle: CreateRouteMatchOptions['routeRules']): boolean {
  assert(queue, 'queue should not be empty')
  if (needle === '*') { return true }

  if (queueKey) {
    const match = needle.find((rule) => {
      if (typeof rule === 'string') {
        const res = rule === queueKey
        return res
      }
      else if (rule instanceof RegExp) {
        const res = rule.test(queueKey)
        return res
      }
    })

    if (match) { return true }
  }

  const match = needle.find((rule) => {
    if (typeof rule === 'string') {
      const res = rule === queue
      return res
    }
    else if (rule instanceof RegExp) {
      const res = rule.test(queue)
      return res
    }
  })
  return !! match

}

