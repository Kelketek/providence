import {PatchersRoot} from './PatchersRoot'

export default interface AttrSpec<T, AttrName extends keyof PatchersRoot<T> & keyof T> {
  name: AttrName,
  value: T[AttrName] | null,
}