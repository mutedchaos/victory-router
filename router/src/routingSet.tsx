import React, { ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

let idCounter = 0

function getUniqueId() {
  return (++idCounter).toString()
}

interface Ctx {
  routes: string[]
  activeRoutes: string[]

  updateRoute(id: string, status: 'new' | 'gone' | 'active' | 'inactive'): void
}

const routingSetContext = React.createContext<null | Ctx>(null)

interface RoutingSetProps {
  children: ReactNode
}

export function RoutingSet({ children }: RoutingSetProps) {
  const [routes, setRoutes] = useState<Ctx['routes']>([])
  const [activeRoutes, setActiveRoutes] = useState<Ctx['activeRoutes']>([])

  const updateRoute = useCallback<Ctx['updateRoute']>((id, status) => {
    switch (status) {
      case 'gone':
        setRoutes((old) => old.filter((r) => r !== id))
        setActiveRoutes((old) => old.filter((r) => r !== id))
        break
      case 'new':
        setRoutes((old) => [...old, id])
        break
      case 'active':
        setActiveRoutes((old) => (old.includes(id) ? old : [...old, id]))
        break
      case 'inactive':
        setActiveRoutes((old) => (old.includes(id) ? old.filter((r) => r !== id) : old))
        break
    }
  }, [])

  const value = useMemo<Ctx>(() => ({ routes, activeRoutes, updateRoute }), [activeRoutes, routes, updateRoute])
  return <routingSetContext.Provider value={value}>{children}</routingSetContext.Provider>
}

export function useRoutingSet() {
  const [id] = useState(getUniqueId)

  const context = useContext(routingSetContext)
  const updateRoute = context?.updateRoute

  const setActive = useCallback(
    (active: boolean) => {
      updateRoute?.(id, active ? 'active' : 'inactive')
    },
    [id, updateRoute]
  )

  useEffect(() => {
    if (updateRoute) {
      updateRoute(id, 'new')
      return () => {
        updateRoute(id, 'gone')
      }
    }
  }, [id, updateRoute])

  const isFallbackActive = !context || context.activeRoutes.length === 0

  return { setActive, isFallbackActive }
}

export function FallbackRoute({ children }: { children: ReactNode }) {
  const routingSet = useRoutingSet()
  if (!routingSet.isFallbackActive) return null
  return <>{children}</>
}
