import {SingleMutations} from './SingleMutations'
import {SingleTasks} from './SingleTasks'
import {SingleState} from './SingleState'
import {BaseModule} from '../../types/BaseModule'

export type BaseSingleModule<T> = BaseModule<SingleState<T>, SingleMutations<T>, SingleTasks<T, BaseSingleModule<T>>>