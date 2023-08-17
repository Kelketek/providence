import ErrorTracking from './ErrorTracking'
import {QueryParams} from './QueryParams'

export default interface FetchableState {
  endpoint: string,
  fetching: boolean,
  ready: boolean,
  failed: boolean,
  params: QueryParams | null,
  errors: ErrorTracking,
}