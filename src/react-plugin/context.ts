import {createContext} from 'react'
import {GlobalContext} from './types/GlobalContext'
import {moduleTransformer} from './helpers'
import {baseCall, deriveErrors} from '../base/lib'

export const defaultContextValues = (): GlobalContext => {
  return {
    options: {
      netCall: baseCall,
      deriveErrors,
      transformers: {
        module: moduleTransformer,
        controller: (val) => val,
        patcher: (val) => val,
      }},
    registries: {single: {}},
  }
}

export const ProvidenceContext = createContext<GlobalContext>(defaultContextValues())
