import ErrorTracking from './ErrorTracking'
import {QueryParams} from './QueryParams'

export interface FetchableControllerProperties {
  endpoint: string,
  ready: boolean,
  failed: boolean,
  fetching: boolean,
  params: QueryParams | null,
  getOnce: () => void,
  errors: ErrorTracking,
  resetErrors: () => void,
}