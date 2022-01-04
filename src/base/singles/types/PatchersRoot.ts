import {PatcherState} from './PatcherState'

export type PatchersRoot<T> = {
  [Property in keyof T]: PatcherState<T, Property>
}