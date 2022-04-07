import {Field} from './Field'

export type FieldSet<T> = {
  [Property in keyof T]: Field<T[Property]>
}
