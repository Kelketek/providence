import {QueryParams} from './QueryParams'
import {Method} from 'axios'

export interface NetCallOptions<T> {
  url: string,
  method?: Method,
  data?: T,
  params?: QueryParams,
  signal: AbortSignal,
}