import { PathParameter, QueryParameter } from 'victory-router'

export const dynamicParameter = new PathParameter()
export const dynamicNumberParameter = new PathParameter(Number)
export const queryRequired = new QueryParameter('req', { required: true })
export const queryOptional = new QueryParameter('opt', { required: false })
