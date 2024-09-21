import { initDbConnectionConfig } from '##/lib/config.js'
import type { DbConfig } from '##/lib/types.js'


export const dbConfig: Partial<DbConfig> = {
  connection: {
    ...initDbConnectionConfig,
  },
}

