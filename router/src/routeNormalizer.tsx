import { memoizeForArrayParameter } from './memoizeForArrayParameter'
import { ConstantPathElement, normalizationToken, PathParameter, QueryParameter, RouteParameter } from './Parameters'

export type UnNormalizedRoute = string | RouteParameter<unknown> | Array<RouteParameter<unknown> | string>

export type NormalizedRoute = Array<RouteParameter<unknown>>

export function normalizeRoute(route: UnNormalizedRoute): NormalizedRoute {
  const arr = makeArray(route)

  const output: NormalizedRoute = [normalizationToken]

  const isPrenormalized = arr[0] === normalizationToken

  let lastSeparator = ''
  for (const item of arr) {
    if (typeof item === 'string') {
      for (const part of item.split(/(?=[/?&])|(?<=[/?&])/)) {
        if (part === '') {
          // do nothing
        } else if (part === '/') {
          if (lastSeparator && lastSeparator !== '/') {
            throw new Error('Not expecting / after ?')
          }
          lastSeparator = '/'
        } else if (part === '&') {
          if (lastSeparator !== '?' && lastSeparator !== '&') {
            throw new Error('Not expecting & before ?')
          }
          lastSeparator = '&'
        } else if (part === '?') {
          if (lastSeparator === '&') {
            throw new Error('Not expectecting ? after &')
          }

          // ? followed by ? is fine though
          lastSeparator = '?'
        } else {
          if (lastSeparator && lastSeparator !== '/') {
            throw new Error('Not expecting "' + part + '" after ?')
          }
          output.push(new ConstantPathElement(part))
          lastSeparator = '/'
        }
      }
    } else if (item instanceof ConstantPathElement) {
      if (lastSeparator && lastSeparator !== '/' && !isPrenormalized) {
        throw new Error('Not expecting ConstantPathElement after ?')
      }
      output.push(item)
    } else if (item instanceof PathParameter) {
      if (lastSeparator && lastSeparator !== '/' && !isPrenormalized) {
        throw new Error('Not expecting a PathParameter after ?')
      }
      output.push(item)
    } else if (item instanceof QueryParameter) {
      if (lastSeparator !== '?' && lastSeparator !== '&' && !isPrenormalized) {
        throw new Error('Not expecting "' + item.name + ' before ?')
      }
      output.push(item)
    } else if (item === normalizationToken) {
      // do nothing
    } else {
      throw new Error('Unexpected: ' + item)
    }
  }
  return output
}

function makeArray(route: UnNormalizedRoute): Array<string | RouteParameter<unknown>> {
  if (Array.isArray(route)) return route
  if (typeof route === 'string') return [route]
  if (route instanceof QueryParameter) return ['?', route]
  return [route]
}

export const memoizedNormalizeRoute = memoizeForArrayParameter(normalizeRoute)
