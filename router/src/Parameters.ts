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

export abstract class QueryParameter<T> extends RouteParameter<T> {
  constructor(public readonly name: string) {
    super()
  }
}

export class RequiredQueryParameter extends QueryParameter<string> {
  constructor(name: string) {
    super(name)
  }

  extractValue(pathElements: string[], queryParameters: QueryParameters): ExtractedValue<string> {
    const value = queryParameters[this.name]
    if (!value) return null
    return { value, remainingPath: pathElements }
  }
}

export class OptionalQueryParameter extends QueryParameter<string | undefined> {
  constructor(name: string) {
    super(name)
  }

  extractValue(pathElements: string[], queryParameters: QueryParameters): ExtractedValue<string | undefined> {
    return { value: queryParameters[this.name], remainingPath: pathElements }
  }
}

export class PathParameter extends RouteParameter<string> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  extractValue(pathElements: string[], _queryParameters: QueryParameters): ExtractedValue<string> {
    if (!pathElements.length) return null
    return { value: pathElements[0], remainingPath: pathElements.slice(1) }
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
