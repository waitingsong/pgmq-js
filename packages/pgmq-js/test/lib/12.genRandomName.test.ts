import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'
import _knex from 'knex'

import { genRandomName } from '##/index.js'


describe(fileShortPath(import.meta.url), () => {

  describe(`genRandomName()`, () => {
    it(`loop`, async () => {
      for (let i = 0; i < 10; i++) {
        const name = genRandomName(6)
        assert(name.length === 6, `name: ${name}`)
      }
    })
  })
})

