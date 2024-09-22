import { Inject, Init, Singleton } from '@midwayjs/core'
import type { DeleteBatchOptions, DeleteOptions, OptionsBase } from '@waiting/pgmq-js'

import type { Message, MsgId, Pgmq } from '##/index.js'
import { convertToDto } from '##/lib/helper.js'
import { PgmqManager } from '##/lib/pgmq-manager.js'

import type { MessageDto } from '../msg.dto.js'


@Singleton()
export class MsgDeleteRepo {
  @Inject() private readonly pgmqManager: PgmqManager
  /** default */
  protected msg: Pgmq['msg']

  @Init()
  async init(): Promise<void> {
    const mq = this.pgmqManager.getDataSource('default')
    this.msg = mq.msg
  }

  async pop(options: OptionsBase): Promise<MessageDto | null> {
    const res = await this.msg.pop(options)
    const ret = res ? convertToDto<Message, MessageDto>(res) : null
    return ret
  }

  async delete(options: DeleteOptions): Promise<MsgId[]> {
    return this.msg.delete(options)
  }

  async deleteBatch(options: DeleteBatchOptions): Promise<MsgId[]> {
    return this.msg.deleteBatch(options)
  }

}

