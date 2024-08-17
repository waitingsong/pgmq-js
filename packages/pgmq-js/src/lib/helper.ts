
export interface RespCommon {
  rows: [{ currenttime: Date }]
}
export function parseRespCommon(res: RespCommon): Date {
  return res.rows[0].currenttime
}


