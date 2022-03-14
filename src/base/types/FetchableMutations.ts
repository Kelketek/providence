import FetchableState from './FetchableState'
import {QueryParams} from './QueryParams'
import ErrorTracking from './ErrorTracking'

export interface FetchableMutations<T extends FetchableState> {
  kill: () => void,
  setEndpoint: (state: T, endpoint: string) => void,
  setReady: (state: T, val: boolean) => void,
  setFailed: (state: T, val: boolean) => void,
  setFetching: (state: T, val: boolean) => void,
  setParams: (state: T, val: QueryParams | null) => void,
  setErrors: (state: T, errors: ErrorTracking) => void,
  resetErrors: (state: T) => void,
}