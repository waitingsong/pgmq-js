import assert from 'node:assert'

import { genRandomString as _genRandomString } from '@waiting/shared-core'

import type { Transaction } from './knex.types.js'


export interface RespCommon {
  rows: [{ currenttime: Date }]
}
export function parseRespCommon(res: RespCommon): Date {
  return res.rows[0].currenttime
}

const regex = /\d/u

export function genRandomName(length = 32): string {
  const str = _genRandomString(length + 1).toLowerCase()
  if (regex.test(str[0] as unknown as string)) {
    return 'a' + str.slice(2)
  }
  return str.slice(0, length)
}

export async function assertWithTrx(
  value: unknown,
  msg: string | Error,
  trx: Transaction | undefined | null,
): Promise<void> {

  try {
    assert(value, msg)
  }
  catch (ex) {
    if (trx) {
      await trx.rollback()
    }
    throw ex
  }
}
