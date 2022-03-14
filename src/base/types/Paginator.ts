import {ListState} from '../lists/types/ListState'
import {ListController} from '../lists/types/ListController'

export interface Paginator {
  initializePagination<T>(state: ListState<T>): ListState<T>
  getCurrentPage<T>(state: ListState<T>): number,
  setPage<T>(controller: ListController<T>, page: number): void,
  getTotalPages<T>(state: ListState<T>): number | null,
}