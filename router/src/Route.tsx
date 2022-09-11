import React, { ReactNode, useContext, useMemo } from 'react'
import { normalizeRoute, UnNormalizedRoute } from './routeNormalizer'
import { NestedRouterProvider, routerContext } from './routerContext'

interface Props {
  route: UnNormalizedRoute
  children: ReactNode
  exact?: boolean
}

const noMatch = { isMatch: false, remainingPath: [], newParameterValues: new Map() }

export function Route({ route, children, exact }: Props) {
  const rc = useContext(routerContext)
  if (!rc) throw new Error('RouterProvider must be in applied')
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

  if (!isMatch) return null

  return (
    <NestedRouterProvider pathComponents={remainingPath} parameterValues={newParameterValues}>
      {children}
    </NestedRouterProvider>
  )
}
