import {AxiosResponse} from 'axios'
import {FormState} from '../forms/types/FormState'

export interface DeriveFormArgs<T> {
  response: AxiosResponse,
  state: FormState<T>,
}