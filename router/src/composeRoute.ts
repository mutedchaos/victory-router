import { RouteParameter } from './Parameters'
import { memoizedNormalizeRoute, NormalizedRoute } from './routeNormalizer'

export function composeRoute(
  stringValues: string[],
  ...routeElements: Array<RouteParameter<unknown>>
): NormalizedRoute {
  const asSimpleArray = stringValues
    .reduce<Array<RouteParameter<unknown> | string>>((acc, elem, i) => [...acc, elem, routeElements[i]], [])
    .slice(0, -1)
  return memoizedNormalizeRoute(asSimpleArray)
}
