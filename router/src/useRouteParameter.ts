import { useContext } from 'react'
import {  RouteParameter } from './Parameters'
import { routerContext } from './routerContext'

type ParameterType<TParam> = TParam extends RouteParameter<infer TValue> ? TValue : never

export function useRouteParameter<TParam extends RouteParameter<unknown>>(parameter: TParam): ParameterType<TParam> {
  const context = useContext(routerContext)
  if (!context) throw new Error('RouterContext is needed')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return parameter.getValue(context) as any
}
