import {FieldOptions} from './FieldOptions'

export type FieldSetOptions<T> = {
  [Property in keyof T]: FieldOptions<T[Property]>
}