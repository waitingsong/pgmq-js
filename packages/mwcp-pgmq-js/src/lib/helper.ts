import assert from 'node:assert'


export function convertToDto<T1 extends object, T2 extends Record<keyof T1, unknown>>(input: T1): T2 {
  assert(input, 'input empty')
  Object.entries(input).forEach(([key, val]) => {
    if (val && val instanceof Date) {
      Object.defineProperty(input, key, {
        value: val.toISOString(),
      })
    }
  })
  return input as unknown as T2
}
