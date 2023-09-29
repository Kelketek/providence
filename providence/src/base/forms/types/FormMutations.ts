import {FormState} from './FormState'
import {FormErrorSet} from './FormErrorSet'
import {FieldSetOptions} from './FieldSetOptions'
import ErrorTracking from '../../types/ErrorTracking'
import {Field} from './Field'
import {Method} from 'axios'

export interface FormMutations<T> {
  kill: (state: FormState<T>) => void,
  setErrors: (state: FormState<T>, errors: FormErrorSet<T>) => void,
  setEndpoint: (state: FormState<T>, endpoint: string) => void,
  setMethod: (state: FormState<T>, method: Method) => void,
  setStep: (state: FormState<T>, step: number) => void,
  setSending: (state: FormState<T>, sending: boolean) => void,
  clearErrors: (state: FormState<T>) => void,
  setMetaErrors: (state: FormState<T>, errors: ErrorTracking) => void,
  updateField: (state: FormState<T>, update: {name: keyof T, settings: Partial<Field<T>>}) => void,
  addFields: (state: FormState<T>, fields: Partial<FieldSetOptions<T>>) => void,
  delFields: (state: FormState<T>, fields: Array<keyof T>) => void,
  resetForm: (state: FormState<T>) => void,
  resetFields: (state: FormState<T>, fields: Array<keyof T>) => void,
}