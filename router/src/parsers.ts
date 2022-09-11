export type BasicType = StringConstructor | NumberConstructor | BooleanConstructor

export type ActualType<T> = T extends StringConstructor
  ? string
  : T extends NumberConstructor
  ? number
  : T extends BooleanConstructor
  ? boolean
  : never

const numberRegexp = /^\d+(\.\d+)?$/

export function parseValue<T extends BasicType>(value: string, type: T): ActualType<T> | ParsingFailed {
  switch (type) {
    case String:
      return value as ActualType<T>
    case Number:
      if (value.match(numberRegexp)) {
        return +value as ActualType<T>
      }
      return parsingFailed
    case Boolean:
      if (value === '' || value === 'true' || value === '1') return true as ActualType<T>
      if (value === 'false' || value === '0') return false as ActualType<T>
      return parsingFailed
    default:
      throw new Error('Unsupported type')
  }
}

export class ParsingFailed {}
export const parsingFailed = new ParsingFailed()
