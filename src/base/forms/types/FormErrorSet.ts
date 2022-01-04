import {FormError} from './FormError'

export interface FormErrorSet<T = any> {
  errors: string[],
  fields: Partial<FormError<T>>
}
