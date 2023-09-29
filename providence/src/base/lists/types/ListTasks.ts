import {BoundStore} from '../../types/BoundStore'
import {BaseListModule} from './BaseListModule'
import {AxiosResponse} from 'axios'

export interface ListTasks<T, K extends BaseListModule<T>> {
  getOnce(store: BoundStore<K>): Promise<void>,
  get(store: BoundStore<K>): Promise<T[]>,
  setList(store: BoundStore<K>, val: T[]): T[],
  prefix(store: BoundStore<K>, val: T[]): void
  extend(store: BoundStore<K>, val: T[]): void
  makeReady(store: BoundStore<K>, val: T[]): T[],
  post<I, O>(store: BoundStore<K>, data: I): Promise<AxiosResponse<O>>,
}