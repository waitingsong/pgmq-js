import { genRandomString as _genRandomString } from '@waiting/shared-core'


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
    return 'a' + str.slice(0, -1)
  }
  return str
}

