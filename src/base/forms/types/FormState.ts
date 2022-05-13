import {FieldSet} from './FieldSet'
import ErrorTracking from '../../types/ErrorTracking'
import {Method} from '../../types/Method'
import {BaseState} from '../../types/BaseState'

export interface FormState<T> extends BaseState {
  fields: FieldSet<T>,
  endpoint: string,
  method: Method,
  errors: ErrorTracking,
  disabled: boolean,
  sending: boolean,
  persistent: boolean,
  step: number,
}
