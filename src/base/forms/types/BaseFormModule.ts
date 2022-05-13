import {BaseModule} from '../../types/BaseModule'
import {FormState} from './FormState'
import {FormMutations} from './FormMutations'
import {FormTasks} from './FormTasks'

export type BaseFormModule<T> = BaseModule<FormState<T>, FormMutations<T>, FormTasks<T, BaseFormModule<T>>>