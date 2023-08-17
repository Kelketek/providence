import {ListState} from './ListState'
import {QueryParams} from '../../types/QueryParams'
import ErrorTracking from '../../types/ErrorTracking'
import {PageInfo} from './PageInfo'

export interface ListMutations<T> {
  kill(): void,
  setPageInfo(state: ListState<T>, pageSettings: PageInfo | null): void,
  setEndpoint(state: ListState<T>, endpoint: string): void,
  setGrow(state: ListState<T>, val: boolean): void,
  setFailed(state: ListState<T>, val: boolean): void,
  setReady(state: ListState<T>, val: boolean): void,
  setFetching(state: ListState<T>, val: boolean): void,
  setParams(state: ListState<T>, params: QueryParams|null): void,
  setErrors(state: ListState<T>, errors: ErrorTracking): void,
  resetErrors(state: ListState<T>): void,
  setRefs(state: ListState<T>, refs: string[]): void,
}