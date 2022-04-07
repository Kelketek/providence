import {Validator} from './Validator'

export interface Validators {
  [key: string]: Validator<any, any, any>
}