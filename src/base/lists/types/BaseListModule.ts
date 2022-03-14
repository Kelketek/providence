import {BaseModule} from '../../types/BaseModule'
import {ListState} from './ListState'
import {ListMutations} from './ListMutations'
import {ListTasks} from './ListTasks'

export type BaseListModule<T> = BaseModule<ListState<T>, ListMutations<T>, ListTasks<T, BaseListModule<T>>>