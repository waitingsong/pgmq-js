import { ConfigKey } from '##/lib/types.js'


export {
  QueueApi, MsgApi,
} from '##/index.js'


export const apiBase = {
  root: '/',
  prefix: `/_${ConfigKey.namespace}`,
  demo: '/demo',

  consumer: '/consumer',
}

export const apiMethod = {
  root: '/',
  hello: 'hello',
  component: 'component',
}
