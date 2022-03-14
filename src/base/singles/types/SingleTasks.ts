import {BaseSingleModule} from './BaseSingleModule'
import {BoundStore} from '../../types/BoundStore'
import {AxiosResponse} from 'axios'

export interface SingleTasks<T, K extends BaseSingleModule<T>> {
  getOnce(store: BoundStore<K>): Promise<void>
  get(store: BoundStore<K>): Promise<T>,
  delete(store: BoundStore<K>): Promise<void>,
  put(store: BoundStore<K>, data: Partial<T>): Promise<T>,
  patch(store: BoundStore<K>, data: Partial<T>): Promise<T>,
  post<I, O>(store: BoundStore<K>, data: I): Promise<AxiosResponse<O>>,
}