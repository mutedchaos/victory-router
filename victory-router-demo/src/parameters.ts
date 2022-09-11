import { PathParameter, QueryParameter } from 'victory-router'

export const dynamicParameter = new PathParameter()
export const dynamicNumberParameter = new PathParameter({ type: Number })
export const queryRequired = new QueryParameter({ name: 'req', required: true })
export const queryOptional = new QueryParameter({ name: 'opt', required: false, type: Number })
