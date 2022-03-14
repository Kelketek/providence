import {ListState} from '../lists/types/ListState'
import {AxiosResponse} from 'axios'

export interface DeriveListArgs<T> {
  response: AxiosResponse,
  state: ListState<T>,
}