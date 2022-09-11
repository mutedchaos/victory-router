import React, { ReactNode } from 'react'
import { useRouteParameter } from 'victory-router'
import { dynamicParameter } from './parameters'

export function WithDynamic({ children }: { children?: ReactNode }) {
  return (
    <p>
      withDynamic {useRouteParameter(dynamicParameter)} {children}
    </p>
  )
}
