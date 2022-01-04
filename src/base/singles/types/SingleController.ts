import {BaseController} from '../../types/BaseController'
import {BaseSingleModule} from './BaseSingleModule'
import {QueryParams} from '../../types/QueryParams'
import {FieldUpdate} from './FieldUpdate'
import {PatchersRoot} from './PatchersRoot'
import {PatcherState} from './PatcherState'
import {BoundPatchers} from '../BoundPatchers'
import ErrorTracking from '../../types/ErrorTracking'

export interface SingleController<T> extends BaseController<BaseSingleModule<T>> {
  endpoint: string,
  x: T | null,
  p: BoundPatchers<T>,
  setX: (val: T | null) => void,
  updateX: (val: Partial<T>) => void,
  getOnce: () => void,
  get: () => Promise<T>,
  patch: (val: Partial<T>) => Promise<T>,
  put: (val: Partial<T>) => Promise<T>,
  post: <I, O = I>(val: I) => Promise<O>,
  delete: () => Promise<null>,
  errors: ErrorTracking,
  resetErrors: () => void,
  makeReady: (val: T) => void,
  setPatcherSetting: <AttrName extends keyof PatchersRoot<T>, Setting extends keyof PatcherState<T, AttrName>>(
    fieldUpdate: FieldUpdate<T, AttrName, Setting>,
  ) => void,
  getPatcherSetting: <AttrName extends keyof PatchersRoot<T>, Setting extends keyof PatcherState<T, AttrName>>(
    attrName: AttrName, setting: Setting,
  ) => PatcherState<T, AttrName>[Setting]
  ensurePatcherSettings: (attrName: keyof PatchersRoot<T>) => void,
  ready: boolean,
  fetching: boolean,
  failed: boolean,
  deleted: boolean,
  params: QueryParams|null,
  toJSON: () => {
    controller: string,
    module: 'single',
    x: T | null,
  }
}