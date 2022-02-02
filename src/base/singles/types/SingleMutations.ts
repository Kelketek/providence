import {SingleState} from './SingleState'
import {QueryParams} from '../../types/QueryParams'
import {FieldUpdate} from './FieldUpdate'
import {PatchersRoot} from './PatchersRoot'
import {PatcherState} from './PatcherState'
import ErrorTracking from '../../types/ErrorTracking'

export interface SingleMutations<T> {
  kill(): void,
  setEndpoint(state: SingleState<T>, endpoint: string): void,
  setFailed(state: SingleState<T>, val: boolean): void,
  setReady(state: SingleState<T>, val: boolean): void,
  setFetching(state: SingleState<T>, val: boolean): void,
  updateX(state: SingleState<T>, x: Partial<T>): void,
  setX(state: SingleState<T>, x: T | null): void,
  setDeleted(state: SingleState<T>, val: boolean): void,
  setParams(state: SingleState<T>, params: QueryParams|null): void,
  setErrors(state: SingleState<T>, errors: ErrorTracking): void,
  resetErrors(state: SingleState<T>): void,
  setPatcherSetting<AttrName extends keyof PatchersRoot<T>, Setting extends keyof PatcherState<T, AttrName>>(
    state: SingleState<T>, fieldUpdate: FieldUpdate<T, AttrName, Setting>,
  ): void,
  ensurePatcherSettings(state: SingleState<T>, attrName: keyof PatchersRoot<T>): void,
}