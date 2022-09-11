import React, { ReactNode, useContext, useMemo } from 'react'
import { normalizeRoute, UnNormalizedRoute } from './routeNormalizer'
import { NestedRouterProvider, routerContext } from './routerContext'
import { useRoutingSet } from './routingSet'

interface Props {
  route: UnNormalizedRoute
  children: ReactNode
  exact?: boolean
  fallback?: ReactNode
}

const noMatch = { isMatch: false, remainingPath: [], newParameterValues: new Map() }

export function Route({ route, children, exact, fallback }: Props) {
  const rc = useContext(routerContext)
  if (!rc) throw new Error('RouterProvider must be in applied')

  const routingSet = useRoutingSet()
  const { pathComponents, queryParameters, parameterValues } = rc

  const normalizedRoute = useMemo(() => normalizeRoute(route), [route])

  const { isMatch, remainingPath, newParameterValues } = useMemo(() => {
    const newParams = new Map(parameterValues)
    let remainingPath = [...pathComponents]

    for (const routeElement of normalizedRoute) {
      const extracted = routeElement.extractValue(remainingPath, queryParameters)
      if (!extracted) return noMatch
      remainingPath = extracted.remainingPath
      newParams.set(routeElement, extracted.value)
    }

    if (exact && remainingPath.length) return noMatch

    return {
      isMatch: true,
      remainingPath,
      newParameterValues: newParams,
    }
  }, [exact, normalizedRoute, parameterValues, pathComponents, queryParameters])

  routingSet.setActive(isMatch)

  if (!isMatch) return fallback ? <>{fallback}</> : null

  return (
    <NestedRouterProvider pathComponents={remainingPath} parameterValues={newParameterValues}>
      {children}
    </NestedRouterProvider>
  )
}
