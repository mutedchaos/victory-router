import React, { ReactNode } from 'react'
import { RouteParameter, useRouteParameter } from 'victory-router'

export function OutputParam({ param, children }: { param: RouteParameter<unknown>; children?: ReactNode }) {
  return (
    <p>
      {useRouteParameter(param)} {children}
    </p>
  )
}
