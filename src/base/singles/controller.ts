import {BaseSingleModule} from './types/BaseSingleModule'
import BaseProxyStore from '../types/BaseProxyStore'
import {GlobalOptions} from '../types/GlobalOptions'
import {SingleController} from './types/SingleController'
import {explodeName} from '../lib'
import {QueryParams} from '../types/QueryParams'
import {FieldUpdate} from './types/FieldUpdate'
import {PatchersRoot} from './types/PatchersRoot'
import {PatcherState} from './types/PatcherState'
import {patcherFactory} from './patcher'
import {Patcher} from './types/Patcher'
import {BoundPatchers} from './BoundPatchers'
import cloneDeep from 'lodash/cloneDeep'
import ErrorTracking from '../types/ErrorTracking'

declare type SingleFactoryArgs<T> = {
  store: BaseProxyStore<BaseSingleModule<T>>,
  options: GlobalOptions,
}

const patcherProxyFactory = <T>(factory: (attrName: string & keyof T) => Patcher<T, typeof attrName>) => {
  return new Proxy<BoundPatchers<T>>(
    {} as BoundPatchers<T>,
    {
      get: (target, attrName: string & keyof T) => {
        if (target[attrName] === undefined) {
          target[attrName] = factory(attrName)
        }
        return target[attrName]
    }})
}

export function singleControllerFactory<T>({store, options}: SingleFactoryArgs<T>) {
  const {commit, dispatch, attr} = store
  const controller: SingleController<T> = {
    // Direct access if needed.
    attr,
    commit,
    dispatch,
    p: patcherProxyFactory((attrName) => {
      return patcherFactory({controller, options, attrName})
    }),
    get name () {
      return attr('name')
    },
    get namespace() {
      return explodeName(controller.name)
    },
    get endpoint() {
      return attr('endpoint')
    },
    set endpoint (val: string) {
      commit('setEndpoint', val)
    },
    get x() {
      return attr('x')
    },
    set x(val: T | null) {
      commit('setX', val)
    },
    get ready() {
      return attr('ready')
    },
    set ready(val: boolean) {
      commit('setReady', val)
    },
    get failed() {
      return attr('failed')
    },
    set failed(val: boolean) {
      commit('setFailed', val)
    },
    get fetching() {
      return attr('fetching')
    },
    set fetching(val: boolean) {
      commit('setFetching', val)
    },
    get deleted() {
      return attr('deleted')
    },
    set deleted(val: boolean) {
      commit('setDeleted', val)
    },
    get params() {
      return attr('params')
    },
    set params(val: QueryParams | null) {
      commit('setParams', val)
    },
    // Sometimes it's most handy to pass around a function that will set X rather than the setter directly.
    setX(val: T | null) {
      commit('setX', val)
    },
    updateX(val: Partial<T>) {
      commit('updateX', val)
    },
    getOnce() {
      dispatch('getOnce')
    },
    get errors() {
      return cloneDeep(attr('errors'))
    },
    set errors(errors: ErrorTracking) {
      commit('setErrors', errors)
    },
    resetErrors() {
      commit('resetErrors')
    },
    ensurePatcherSettings(attrName: keyof PatchersRoot<T>) {
      commit('ensurePatcherSettings', attrName)
    },
    setPatcherSetting<AttrName extends keyof PatchersRoot<T>, Setting extends keyof PatcherState<T, AttrName>>(fieldUpdate: FieldUpdate<T, AttrName, Setting>) {
      commit('setPatcherSetting', fieldUpdate)
    },
    getPatcherSetting(attrName, settingName) {
      // The patcher should always ensure this exists.
      return attr('patchers')[attrName]![settingName] // eslint-disable-line @typescript-eslint/no-non-null-assertion
    },
    makeReady(val: T) {
      // Mostly used for testing, can be used to set the value of X in a component that would otherwise be waiting
      // on a network call to complete.
      commit('setX', val)
      commit('setFetching', false)
      commit('setReady', true)
    },
    preDestroy() {
      commit('kill')
    },
    async get() {
      return dispatch('get')
    },
    async patch(val: Partial<T>) {
      return dispatch('patch', val)
    },
    async put(val: Partial<T>) {
      return dispatch('put', val)
    },
    async delete() {
      return dispatch('delete')
    },
    async post<I, O>(val: I) {
      return await dispatch<'post'>('post', val) as O
    },
    toJSON: () => {
      return {controller: controller.name, module: 'single', x: controller.x}
    }
  }
  return options.transformers.controller(controller)
}