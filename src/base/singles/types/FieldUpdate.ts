import {PatchersRoot} from './PatchersRoot'
import {PatcherState} from './PatcherState'

export interface FieldUpdate<T, AttrName extends keyof PatchersRoot<T>, Setting extends keyof PatcherState<T, AttrName>> {
  attrName: AttrName,
  settingName: Setting,
  val: PatchersRoot<T>[AttrName][Setting]
}