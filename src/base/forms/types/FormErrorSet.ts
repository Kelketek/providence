import {FieldErrors} from './FieldErrors'

export interface FormErrorSet<T = any> {
  status: string,
  messages: string[],
  fields: Partial<FieldErrors<T>>
}
