import {createContext} from 'react'
import {NetCallOptions} from '../base/types/NetCallOptions'
import axios, {AxiosResponse} from 'axios'
import {GlobalContext} from './types/GlobalContext'
import {moduleTransformer} from './helpers'
import {deriveErrors} from '../base/lib'


// Example wrapper function around Axios. You'll want to replace this with
// one that includes whatever authentication headers etc., you need to provide.
export function baseCall(options: NetCallOptions<any>): Promise<any> {
  const preSuccess = (response: AxiosResponse) => {
    return response.data
  }
  const config = {...options, preSuccess}
  return axios.request(config).then(preSuccess)
}

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
