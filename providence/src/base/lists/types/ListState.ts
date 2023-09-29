import {QueryParams} from '../../types/QueryParams'
import {PageInfo} from './PageInfo'
import ErrorTracking from '../../types/ErrorTracking'

export interface ListState<T> {
  pageInfo: null | PageInfo,
  refs: string[],
  grow: boolean,
  endpoint: string,
  persistent: boolean,
  ready: boolean,
  keyProp: keyof T,
  // Needed for self-reference when constructing submodules.
  name: string,
  fetching: boolean,
  reverse: boolean,
  failed: boolean,
  paginated: boolean,
  params: QueryParams | null,
  errors: ErrorTracking,
}
