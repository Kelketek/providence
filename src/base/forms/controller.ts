import cloneDeep from 'lodash/cloneDeep'
import {v4 as randomUUID} from 'uuid'
import {FormController} from './types/FormController'
import BaseProxyStore from '../types/BaseProxyStore'
import {GlobalOptions} from '../types/GlobalOptions'
import {BaseFormModule} from './types/BaseFormModule'
import {explodeName} from '../lib'
import {AxiosError, Method} from 'axios'
import {Fielder} from './types/Fielder'
import {fielderFactory} from './fielder'
import {BoundFielders} from './types/BoundFielders'
import {dataFromForm} from './index'

export type FormFactoryArgs<T> = {
  store: BaseProxyStore<BaseFormModule<T>>,
  globalOptions: GlobalOptions,
}

const fielderProxyFactory = <T>(factory: (attrName: string & keyof T) => Fielder<T, typeof attrName>, getController: () => FormController<T>) => {
  let controller: FormController<T>
  return new Proxy<BoundFielders<T>>(
    {} as BoundFielders<T>,
    {
      get: (target, fieldName: string & keyof T) => {
        if (!controller) {
          controller = getController()
        }
        // Fields can be removed. Make sure we garbage collect them and return undefined rather than a broken
        // fielder.
        if (!controller.hasField(fieldName)) {
          delete target[fieldName]
          return undefined
        }
        if (target[fieldName] === undefined) {
          target[fieldName] = factory(fieldName)
        }
        return target[fieldName]
      }})
}

export function formControllerFactory<T>({store, globalOptions}: FormFactoryArgs<T>) {
  const {commit, dispatch, attr, moduleState} = store
  const controller: FormController<T> = {
    get moduleType(): 'form' {
      return 'form'
    },
    uid: randomUUID(),
    // Direct access if needed.
    attr,
    commit,
    dispatch,
    f: fielderProxyFactory(
      (fieldName) => fielderFactory({controller, globalOptions, fieldName}),
      () => controller,
    ),
    get name () {
      return controller.attr('name')
    },
    get namespace() {
      return explodeName(controller.name)
    },
    get managedNames() {
      return [this.name]
    },
    get rawState() {
      return moduleState()
    },
    get endpoint() {
      return controller.attr('endpoint')
    },
    set endpoint(val: string) {
      controller.commit('setEndpoint', val)
    },
    get method() {
      return controller.attr('method')
    },
    set method(val: Method) {
      controller.commit('setMethod', val)
    },
    get sending() {
      return controller.attr('sending')
    },
    set sending(val) {
      controller.commit('setSending', val)
    },
    get step() {
      return controller.attr('step')
    },
    set step(val) {
      controller.commit('setStep', val)
    },
    get status() {
      return controller.attr('errors').status
    },
    set status(val) {
      const newErrors = cloneDeep(controller.attr('errors'))
      newErrors.status = val
      controller.commit('setMetaErrors', newErrors)
    },
    get errors() {
      return controller.attr('errors').messages
    },
    set errors(errors) {
      const newErrors = cloneDeep(controller.attr('errors'))
      newErrors.messages = errors
      controller.commit('setMetaErrors', newErrors)
    },
    get data() {
      return dataFromForm(controller.rawState)
    },
    hasField(fieldName) {
      return !!controller.rawState.fields[fieldName as keyof T]
    },
    getFieldSetting(name, settingName) {
      return controller.rawState.fields[name][settingName]
    },
    setFieldSetting(name, settingName, value) {
      controller.commit('updateField', {name, settings: {[settingName]: value}})
    },
    delFields(names) {
      controller.commit('delFields', names)
    },
    addFields(fieldSpec) {
      controller.commit('addFields', fieldSpec)
    },
    setErrors(errorSet) {
      controller.commit('setErrors', errorSet)
    },
    submit<K = T>() {
      controller.stopValidators()
      return controller.dispatch('submit') as Promise<K>
    },
    stopValidators() {
      for (const key of Object.keys(controller.rawState.fields)) {
        const fieldName = key as keyof T
        controller.f[fieldName].cancelValidation()
      }
    },
    handleError(error: AxiosError) {
      const errorSet = globalOptions.client.deriveErrors(error, Object.keys(controller.rawState.fields))
      controller.stopValidators()
      controller.setErrors(errorSet)
      let step = 0
      for (const key of Object.keys(errorSet.fields)) {
        const fieldName = key as keyof T
        if ((controller.f[fieldName].step < step) || step === 0) {
          step = controller.f[fieldName].step
        }
      }
      controller.sending = false
      controller.step = step || controller.step
    },
    clearErrors() {
      controller.stopValidators()
      controller.commit('clearErrors')
    },
    reset() {
      controller.stopValidators()
      controller.commit('resetForm')
    },
    preDestroy() {
      controller.stopValidators()
      controller.commit('kill')
    },
  }
  return globalOptions.transformers.controller(controller as FormController<T>)
}