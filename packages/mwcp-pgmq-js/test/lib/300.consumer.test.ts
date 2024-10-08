import assert from 'node:assert'

import { fileShortPath, sleep } from '@waiting/shared-core'

import { genRandomName } from '##/index.js'
import { apiBase, apiMethod } from '#@/api-test.js'
import { ConsumerTestService } from '#@/fixtures/base-app/src/consumer/300s.consumer.service.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), () => {

  const q1 = 'q1'
  const q2 = 'q2'
  const q3 = 'q3'
  const msgToSend1 = { rnd: genRandomName(6) }
  const msgToSend2 = { rnd: genRandomName(6) }
  const msgToSend3 = { rnd: genRandomName(6) }

  const helloPath = `${apiBase.consumer}/${apiMethod.hello}`

  it(`Should ${helloPath} work`, async () => {
    const { container, httpRequest, mq } = testConfig

    const resp = await httpRequest.get(helloPath)
    assert(resp.ok, resp.text)

    const consumer = await container.getAsync(ConsumerTestService)
    assert(consumer, 'consumer not found')

    await mq.msg.send({ queue: q1, msg: msgToSend1, delay: 1 })
    await mq.msg.send({ queue: q2, msg: msgToSend2, delay: 2 })
    await mq.msg.send({ queue: q3, msg: msgToSend3, delay: 2 })

    assert(consumer.msgs1.length === 0, 'msgs1.length !== 0')
    assert(consumer.msgs2.length === 0, 'msgs2.length !== 0')
    assert(consumer.msgs3.length === 0, 'msgs3.length !== 0')

    await sleep(3500)

    const { msgs1, msgs2, msgs3 } = consumer
    assert(msgs1.length === 1, 'msgs1.length !== 1')
    assert(msgs2.length === 1, 'msgs2.length !== 1')
    assert(msgs3.length === 1, 'msgs3.length !== 1')

    const [msg1, msg2, msg3] = [msgs1[0], msgs2[0], msgs3[0]]
    assert(msg1?.queue === q1, `msg1.queue !== 'q1'`)
    assert(msg2?.queue === q2, `msg2.queue !== 'q2'`)
    assert(msg3?.queue === q3, `msg3.queue !== 'q3`)

    assert.deepStrictEqual(msg1.message, msgToSend1)
    assert.deepStrictEqual(msg2.message, msgToSend2)
    assert.deepStrictEqual(msg3.message, msgToSend3)
  })

})

