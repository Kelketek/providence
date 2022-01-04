import {SingleController} from './SingleController'
import {PatcherState} from './PatcherState'
import lodash from 'lodash'

export interface Patcher<T, AttrName extends keyof T> {
  attrName: AttrName,
  controller: SingleController<T>,
  cached: null | T[AttrName],
  dirty: boolean,
  patching: boolean,
  loaded: boolean,
  errors: string[],
  model: T[AttrName],
  rawValue: T[AttrName],
  set: (val: T[AttrName]) => void,
  rawSet: (val: T[AttrName]) => void,
  debouncedRawSet: lodash.DebouncedFunc<(val: T[AttrName]) => void>,
  cancelController: AbortController,
  setSetting: <Setting extends keyof PatcherState<T, AttrName>>(
    settingName: Setting, val: PatcherState<T, AttrName>[Setting],
  ) => void,
  getSetting: <Setting extends keyof PatcherState<T, AttrName>>(
    settingName: Setting
  ) => PatcherState<T, AttrName>[Setting],
  toJSON: () => {attrName: AttrName, controller: string, rawValue: T[AttrName], module: 'patcher'}
}