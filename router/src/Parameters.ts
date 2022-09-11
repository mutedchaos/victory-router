import { ActualType, BasicType, parseValue, parsingFailed, ParsingFailed } from './parsers'
import { QueryParameters, RouterContextData } from './routerContext'

type ExtractedValue<T> = {
  remainingPath: string[]
  value: T
} | null

export abstract class RouteParameter<T> {
  abstract extractValue(pathElements: string[], queryParameters: QueryParameters): ExtractedValue<T>

  getValue(ctxData: RouterContextData): T {
    if (!ctxData.parameterValues.has(this)) {
      throw new Error('Parameter not configured for this context')
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ctxData.parameterValues.get(this) as unknown as any
  }
}

type QueryParameterOptions = { name: string } & ({ required: true } | { required: false })

type ApplyRequiredness<TType, TRequired> = TRequired extends true ? TType : TType | undefined

type ParseValueParam<T> = T extends true ? string : string | undefined

export abstract class QueryParameterBase<
  T,
  TQueryParameterOptions extends QueryParameterOptions
> extends RouteParameter<ApplyRequiredness<T, TQueryParameterOptions['required']>> {
  constructor(private options: TQueryParameterOptions) {
    super()
  }

  get name() {
    return this.options.name
  }

  extractValue(
    pathElements: string[],
    queryParameters: QueryParameters
  ): ExtractedValue<ApplyRequiredness<T, TQueryParameterOptions['required']>> {
    const value = queryParameters[this.options.name]
    if (value === undefined && this.options.required) return null
    const parsedValue = this.parseValue(value)

    if (parsedValue instanceof ParsingFailed) return null

    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value: parsedValue as any,
      remainingPath: pathElements,
    }
  }

  abstract parseValue(value: ParseValueParam<TQueryParameterOptions['required']>): T | ParsingFailed
}

type TypedQueryParameterOptions<T extends BasicType> = QueryParameterOptions & {
  type?: T
}

type GetQueryType<T> = T extends TypedQueryParameterOptions<infer U> ? (U extends BasicType ? U : never) : never

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class QueryParameter<TOptions extends TypedQueryParameterOptions<any>> extends QueryParameterBase<
  ActualType<GetQueryType<TOptions>>,
  TOptions
> {
  constructor(private typedOptions: TOptions) {
    super(typedOptions)
  }

  parseValue(value: string | undefined): ActualType<GetQueryType<TOptions>> | ParsingFailed {
    if (value === undefined) {
      if (this.typedOptions.type === Boolean) {
        return false
      }
      return parsingFailed
    }
    return parseValue(value, this.typedOptions.type ?? String)
  }
}

export abstract class PathParameterBase<T> extends RouteParameter<T> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  extractValue(pathElements: string[], _queryParameters: QueryParameters): ExtractedValue<T> {
    if (!pathElements.length) return null
    const parsed = this.parseValue(pathElements[0])
    if (parsed instanceof ParsingFailed) return null
    return { value: parsed, remainingPath: pathElements.slice(1) }
  }

  abstract parseValue(value: string): T | ParsingFailed
}

export class PathParameter<TType extends BasicType = StringConstructor> extends PathParameterBase<ActualType<TType>> {
  constructor(private options: { type?: TType } = {}) {
    super()
  }

  parseValue(value: string): ActualType<TType> | ParsingFailed {
    return parseValue(value, this.options.type ?? String)
  }
}

export class ConstantPathElement extends RouteParameter<void> {
  constructor(public readonly pathElementString: string) {
    super()
  }

  extractValue(pathElements: string[]): ExtractedValue<void> {
    if (pathElements[0] !== this.pathElementString) return null

    return { value: void 0, remainingPath: pathElements.slice(1) }
  }
}

export class NormalizationToken extends RouteParameter<void> {
  extractValue(pathElements: string[]): ExtractedValue<void> {
    return { value: void 0, remainingPath: pathElements }
  }
}

export const normalizationToken = new NormalizationToken()

export class QueryPresenseMatcher extends RouteParameter<void> {
  constructor(public readonly name: string, public readonly negated = false) {
    super()
  }

  extractValue(pathElements: string[], queryParameters: QueryParameters): ExtractedValue<void> {
    if (!(this.name in queryParameters) !== this.negated) return null
    return { value: void 0, remainingPath: pathElements }
  }
}

export class QueryMatcher extends RouteParameter<string> {
  constructor(public readonly name: string, public readonly value: string | RegExp, public readonly negated = false) {
    super()
  }

  extractValue(pathElements: string[], queryParameters: QueryParameters): ExtractedValue<string> {
    if (!(this.name in queryParameters)) {
      if (this.negated) return { value: '', remainingPath: pathElements }
      return null
    }

    const value = queryParameters[this.name]
    if (this.isMatch(value) === this.negated) return null

    return { value, remainingPath: pathElements }
  }

  private isMatch(value: string) {
    if (typeof this.value === 'string') return value === this.value

    return Boolean(value.match(this.value))
  }
}
