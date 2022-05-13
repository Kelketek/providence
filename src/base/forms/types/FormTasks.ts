import {BoundStore} from '../../types/BoundStore'
import {BaseFormModule} from './BaseFormModule'

export interface FormTasks<T, FormModuleDefinition extends BaseFormModule<T>> {
  submit: <K = T>(store: BoundStore<FormModuleDefinition>) => Promise<K>,
}