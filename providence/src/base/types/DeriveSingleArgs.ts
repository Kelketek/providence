import {AxiosResponse} from 'axios'
import {SingleState} from '../singles/types/SingleState'

export interface DeriveSingleArgs<T> {
  response: AxiosResponse,
  state: SingleState<T>,
}