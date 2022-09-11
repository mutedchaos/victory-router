import React, { ReactNode } from 'react'
import { RouteParameter, useRouteParameter } from 'victory-router'

export function OutputParam({ param, children }: { param: RouteParameter<unknown>; children?: ReactNode }) {
  const value = useRouteParameter(param)

  return (
    <p>
      {value as ReactNode} {children}
    </p>
  )
}
