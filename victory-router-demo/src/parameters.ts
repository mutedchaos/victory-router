import { OptionalQueryParameter, PathParameter, RequiredQueryParameter } from 'victory-router'

export const dynamicParameter = new PathParameter()
export const queryRequired = new RequiredQueryParameter('req')
export const queryOptional = new OptionalQueryParameter('opt')
