import React, { ReactNode, useContext, useMemo } from 'react'
import queryString from 'query-string'
import { useCurrentURL } from './useCurrentURL'
import { RouteParameter } from './Parameters'

export type QueryParameters = {
  [key: string]: string
}

export interface RouterContextData {
  pathComponents: string[]
  queryParameters: QueryParameters
  parameterValues: Map<RouteParameter<unknown>, unknown>
}

export const routerContext = React.createContext<RouterContextData | null>(null)

interface Props {
  children: ReactNode
}

const emptyParameterValues = new Map()

export function RouterProvider({ children }: Props) {
  const url = useCurrentURL()
  const value = useMemo<RouterContextData>(() => {
    const urlObject = new URL(url)
    return {
      pathComponents: urlObject.pathname.split('/').filter((x) => x),
      queryParameters: (queryString.parse(urlObject.search) ?? {}) as unknown as RouterContextData['queryParameters'],
      parameterValues: emptyParameterValues,
    }
  }, [url])

  return <routerContext.Provider value={value}>{children}</routerContext.Provider>
}

export function NestedRouterProvider({
  children,
  pathComponents,
  parameterValues,
}: Props & { pathComponents: string[]; parameterValues: RouterContextData['parameterValues'] }) {
  const initialValue = useContext(routerContext)
  if (!initialValue) throw new Error('RouterProvider needed')
  const value = useMemo<RouterContextData>(() => {
    return {
      ...initialValue,
      pathComponents,
      parameterValues,
    }
  }, [initialValue, parameterValues, pathComponents])
  return <routerContext.Provider value={value}>{children}</routerContext.Provider>
}
