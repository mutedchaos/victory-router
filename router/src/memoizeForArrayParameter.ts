// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Memoizable = (arg: any[]) => unknown

export function memoizeForArrayParameter<T extends Memoizable>(toMemoize: T): T {
  const memory: Array<{ input: unknown[]; output: unknown }> = []

  return ((array: unknown[]): unknown => {
    const match = memory.find(
      (stored) => stored.input.length === array.length && array.every((entry, i) => stored.input[i] === entry)
    )
    if (match) return match.output

    const value = toMemoize(array)
    memory.push({ input: array, output: value })
    return value
  }) as T
}
