import {GlobalOptions} from '../types/GlobalOptions'
import {FormController} from './types/FormController'
import {Fielder} from './types/Fielder'
import cloneDeep from 'lodash/cloneDeep'
import {memoizer} from '../lib'
import debounce from 'lodash/debounce'

export interface FielderArgs<T, FieldName extends keyof T> {
  controller: FormController<T>,
  globalOptions: GlobalOptions,
  fieldName: FieldName,
}

export const fielderFactory = <T, FieldName extends keyof T>({controller, globalOptions, fieldName}: FielderArgs<T, FieldName>): Fielder<T, FieldName> => {
  const cancel = {controller: new AbortController()}
  const memoizedDebounce = memoizer(debounce)
  const fielder: Fielder<T, FieldName> = {
    get moduleType(): 'fielder' {
      return 'fielder'
    },
    get fieldName() {
      return fieldName
    },
    attr(attrName) {
      return controller.getFieldSetting(fieldName, attrName)
    },
    get rawValue() {
      return fielder.attr('value') as T[FieldName]
    },
    set rawValue(value) {
      fielder.controller.setFieldSetting(fieldName, 'value', value)
    },
    get model() {
      return cloneDeep(fielder.attr('value')) as T[FieldName]
    },
    set model(value) {
      fielder.rawValue = value
      fielder.validate()
    },
    get errors() {
      return fielder.attr('errors')
    },
    set errors(value) {
      fielder.controller.setFieldSetting(fieldName, 'errors', value)
    },
    get debounce() {
      return fielder.attr('debounce')
    },
    set debounce(value) {
      fielder.controller.setFieldSetting(fieldName, 'debounce', value)
    },
    get disabled() {
      return fielder.attr('disabled')
    },
    set disabled(value) {
      fielder.controller.setFieldSetting(fieldName, 'disabled', value)
    },
    get step() {
      return fielder.controller.getFieldSetting(fieldName, 'step')
    },
    set step(val) {
      fielder.controller.setFieldSetting(fieldName, 'step', val)
    },
    get validate() {
      return memoizedDebounce(fielder.runValidators, fielder.debounce, {trailing: true})
    },
    get controller() {
      return controller
    },
    get initialValue() {
      return fielder.controller.getFieldSetting(fieldName, 'initialValue') as T[FieldName]
    },
    set initialValue(val) {
      fielder.controller.setFieldSetting(fieldName, 'initialValue', val)
    },
    reset() {
      fielder.controller.commit('resetFields', [fieldName])
    },
    cancelValidation() {
      this.validate.cancel()
      cancel.controller.abort()
      cancel.controller = new AbortController()
    },
    runValidators() {
      const promiseSet: Promise<string[]>[] = []
      for (const validatorSpec of fielder.attr('validators')) {
        if (!globalOptions.validators[validatorSpec.name]) {
          console.error(
            `Unregistered validator: ${validatorSpec.name}\nOptions are: ${Object.keys(globalOptions.validators)}`)
          continue
        }
        const args = {
          args: cloneDeep(validatorSpec.args || {}),
          formState: controller.rawState,
          fieldName: fieldName,
          signal: cancel.controller.signal,
          value: fielder.rawValue,
        }
        promiseSet.push(
          globalOptions.validators[validatorSpec.name](args)
        )
      }
      const fullPromiseSet = [...promiseSet]
      fullPromiseSet.push(new Promise<string[]>((resolve, reject) => {
        // This rejection should always be last, and thus will never actually get handed to the later Promise.all's
        // rejection handler, since any case where it would be thrown, a previous promise would have already thrown, and
        // Promise.all only handles the first failure to catch.
        cancel.controller.signal.addEventListener('abort', () => reject('Cancelled.'))
        Promise.all(promiseSet).then(() => resolve([]))
        // In this case, however, it may be the first.
      }))
      // Batch up the results of all validators to avoid having the form error messages bounce back and forth between
      // valid and invalid.
      const errors: string[] = []
      return Promise.all(fullPromiseSet).then((results: string[][]) => {
        for (const result of results) {
          errors.push(...result)
        }
        fielder.errors = errors
      }).catch((reason) => {
        if (reason === 'Cancelled.') {
          return
        }
      })
    },
    toJSON: () => {
      return {fieldName, controller: controller.name, moduleType: fielder.moduleType, value: fielder.rawValue}
    },
  }
  globalOptions.transformers.fielder(fielder)
  return fielder
}