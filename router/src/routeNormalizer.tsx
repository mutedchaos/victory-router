import { memoizeForArrayParameter } from './memoizeForArrayParameter'
import {
  ConstantPathElement,
  normalizationToken,
  PathParameter,
  QueryMatcher,
  QueryParameter,
  QueryPresenseMatcher,
  RouteParameter,
} from './Parameters'

export type UnNormalizedRoute = string | RouteParameter<unknown> | Array<RouteParameter<unknown> | string>

export type NormalizedRoute = Array<RouteParameter<unknown>>

export function normalizeRoute(route: UnNormalizedRoute): NormalizedRoute {
  const routeElements = makeArray(route)

  const output: NormalizedRoute = [normalizationToken]

  const isPrenormalized = routeElements[0] === normalizationToken

  let lastSeparator = ''
  for (const routeElement of routeElements) {
    if (typeof routeElement === 'string') {
      for (const stringRouteElement of routeElement.split(/(?=[/?&])|(?<=[/?&])/)) {
        if (stringRouteElement === '') {
          // do nothing
        } else if (stringRouteElement === '/') {
          if (lastSeparator && lastSeparator !== '/') {
            throw new Error('Not expecting / after ?')
          }
          lastSeparator = '/'
        } else if (stringRouteElement === '&') {
          if (lastSeparator !== '?' && lastSeparator !== '&') {
            throw new Error('Not expecting & before ?')
          }
          lastSeparator = '&'
        } else if (stringRouteElement === '?') {
          if (lastSeparator === '&') {
            throw new Error('Not expectecting ? after &')
          }

          // ? followed by ? is fine though
          lastSeparator = '?'
        } else {
          if (lastSeparator === '?' || lastSeparator === '&') {
            if (stringRouteElement.includes('=')) {
              const index = stringRouteElement.indexOf('=') // using index in case value has an equals in it
              if (stringRouteElement[index - 1] === '!') {
                output.push(
                  new QueryMatcher(
                    stringRouteElement.substring(0, index - 1),
                    decodeURIComponent(stringRouteElement.substring(index + 1)),
                    true
                  )
                )
              } else {
                output.push(
                  new QueryMatcher(
                    stringRouteElement.substring(0, index),
                    decodeURIComponent(stringRouteElement.substring(index + 1))
                  )
                )
              }
            } else {
              if (stringRouteElement.startsWith('!')) {
                output.push(new QueryPresenseMatcher(stringRouteElement.substring(1), true))
              } else {
                output.push(new QueryPresenseMatcher(stringRouteElement))
              }
            }
          } else {
            output.push(new ConstantPathElement(stringRouteElement))
            lastSeparator = '/'
          }
        }
      }
    } else if (routeElement instanceof ConstantPathElement) {
      if (lastSeparator && lastSeparator !== '/' && !isPrenormalized) {
        throw new Error('Not expecting ConstantPathElement after ?')
      }
      output.push(routeElement)
    } else if (routeElement instanceof PathParameter) {
      if (lastSeparator && lastSeparator !== '/' && !isPrenormalized) {
        throw new Error('Not expecting a PathParameter after ?')
      }
      output.push(routeElement)
    } else if (routeElement instanceof QueryParameter) {
      if (lastSeparator !== '?' && lastSeparator !== '&' && !isPrenormalized) {
        throw new Error('Not expecting "' + routeElement.name + ' before ?')
      }
      output.push(routeElement)
    } else if (routeElement === normalizationToken) {
      // do nothing
    } else {
      throw new Error('Unexpected: ' + routeElement)
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
