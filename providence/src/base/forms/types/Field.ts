import {ValidatorSpec} from './ValidatorSpec'

export interface Field<ValType> {
  disabled: boolean,
  validators: ValidatorSpec[],
  value: ValType,
  errors: string[],
  initialValue: ValType,
  debounce: number,
  omitIf?: any
  step: number,
}
