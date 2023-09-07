import {v4 as randomUUID} from 'uuid'
import {BaseSingleModule} from './types/BaseSingleModule'
import BaseProxyStore from '../types/BaseProxyStore'
import {GlobalOptions} from '../types/GlobalOptions'
import {SingleController} from './types/SingleController'
import {completeAssign, explodeName} from '../lib'
import {FieldUpdate} from './types/FieldUpdate'
import {PatchersRoot} from './types/PatchersRoot'
import {PatcherState} from './types/PatcherState'
import {patcherFactory} from './patcher'
import {Patcher} from './types/Patcher'
import {BoundPatchers} from './types/BoundPatchers'
import {FetchableControllerProperties} from '../types/FetchableControllerProperties'
import {fetchableProperties} from '../lib/fragments'
import {AxiosResponse} from 'axios'

export type SingleFactoryArgs<T> = {
  store: BaseProxyStore<BaseSingleModule<T>>,
  globalOptions: GlobalOptions,
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

export function singleControllerFactory<T>({store, globalOptions}: SingleFactoryArgs<T>) {
  const {commit, dispatch, attr, moduleState} = store
  const controller: Omit<SingleController<T>, keyof FetchableControllerProperties> = {
    get moduleType (): 'single' {
      return 'single'
    },
    uid: randomUUID(),
    // Direct access if needed.
    attr,
    commit,
    dispatch,
    p: patcherProxyFactory((attrName) => {
      const castController = controller as SingleController<T>
      return patcherFactory({controller: castController, globalOptions, attrName})
    }),
    get name () {
      return controller.attr('name')
    },
    get namespace() {
      return explodeName(controller.name)
    },
    get managedNames() {
      return [this.name]
    },
    get x() {
      return controller.attr('x')
    },
    set x(val: T | null) {
      controller.commit('setX', val)
    },
    get deleted() {
      return controller.attr('deleted')
    },
    set deleted(val: boolean) {
      controller.commit('setDeleted', val)
    },
    get rawState() {
      return moduleState()
    },
    // Sometimes it's most handy to pass around a function that will set X rather than the setter directly.
    setX(val: T | null) {
      controller.commit('setX', val)
    },
    updateX(val: Partial<T>) {
      controller.commit('updateX', val)
    },
    initializePatcherSettings(attrName: keyof T) {
      controller.commit('initializePatcherSettings', attrName)
    },
    setPatcherSetting<AttrName extends keyof PatchersRoot<T>, Setting extends keyof PatcherState<T, AttrName>>(fieldUpdate: FieldUpdate<T, AttrName, Setting>) {
      controller.commit('setPatcherSetting', fieldUpdate)
    },
    getPatcherSetting(attrName, settingName) {
      // The patcher should always ensure this exists.
      return controller.attr('patchers')[attrName]![settingName] // eslint-disable-line @typescript-eslint/no-non-null-assertion
    },
    makeReady(val: T) {
      // Mostly used for testing, can be used to set the value of X in a component that would otherwise be waiting
      // on a network call to complete.
      controller.commit('setX', val)
      controller.commit('setFetching', false)
      controller.commit('setReady', true)
    },
    preDestroy() {
      controller.commit('kill')
    },
    async get() {
      return controller.dispatch('get')
    },
    async patch(val: Partial<T>) {
      return controller.dispatch('patch', val)
    },
    async put(val: Partial<T>) {
      return controller.dispatch('put', val)
    },
    async delete() {
      return controller.dispatch('delete')
    },
    async post<I, O>(val: I) {
      return await controller.dispatch<'post'>('post', val) as AxiosResponse<O>
    },
    toJSON: () => {
      return {controller: controller.name, moduleType: controller.moduleType, x: controller.x}
    }
  }
  completeAssign<SingleController<T>>(controller, fetchableProperties(controller))
  return globalOptions.transformers.controller(controller as SingleController<T>)
}
