/**
* Patcher. This object is a proxy to a particular key on a single. It handles changes in a debounced, cached manner,
* sending a patch request and updating the single as needed.
*
* Patchers could become standard controllers/modules like Singles and eventually Lists are, but for now are
* kept separate to closer match the source structure in Artconomy under time constraints. This may be revisited after
* lists are implemented, since the decision on how to do 'subcontrollers/submodules' will be decided then.
*
* Unlike the singles in lists, however, patchers do affect the source data, which makes them a bit special.
 */

import debounce from 'lodash/debounce'
import {GlobalOptions} from '../types/GlobalOptions'
import {SingleController} from './types/SingleController'
import {Patcher} from './types/Patcher'
import {PatcherState} from './types/PatcherState'
import axios, {AxiosError} from 'axios'
import {isObject} from '../lib'
import cloneDeep from 'lodash/cloneDeep'


export interface PatcherArgs<T, K extends keyof T> {
  controller: SingleController<T>,
  globalOptions: GlobalOptions,
  attrName: K,
}

// Used by the Singles Module for initializing/ensuring a patcher's state.
export const initialPatcherState = <T, AttrName extends keyof T>(): PatcherState<T, AttrName> => ({
  cached: null,
  errors: [],
  dirty: false,
  patching: false,
})

export function errorSend<T, AttrName extends keyof T>(patcher: Patcher<T, AttrName>, globalOptions: GlobalOptions): (error: AxiosError) => void {
  return (error: AxiosError) => {
    const attrName = patcher.attrName as string & keyof T
    // jest-mock-axios library doesn't have a way to test this, unfortunately. It's still uses the old 'cancelToken'
    // schema rather than abort controllers.
    /* istanbul ignore if */
    if (axios.isCancel(error)) {
      // We recalled the request deliberately. This is not an error, so ignore. Also, this should only happen when
      // sending a new request, so don't reset the patching flag.
      return
    }
    const errors = globalOptions.client.deriveErrors<T>(error, [attrName])
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    const message = (errors.fields[attrName] && errors.fields[attrName]![0]) || errors.messages[0]
    /* eslint-enable @typescript-eslint/no-non-null-assertion */
    patcher.errors = [message]
    patcher.patching = false
  }
}

export const patcherFactory = <T, AttrName extends keyof T>({controller, globalOptions, attrName}: PatcherArgs<T, AttrName>): Patcher<T, AttrName> => {
  const patcher: Patcher<T, AttrName> = {
    get moduleType (): 'patcher' {
      return 'patcher'
    },
    controller,
    cancelController: new AbortController(),
    setSetting<Setting extends keyof PatcherState<T, AttrName>>(settingName: Setting, val: PatcherState<T, AttrName>[Setting]) {
      controller.setPatcherSetting({attrName, settingName, val})
    },
    getSetting<Setting extends keyof PatcherState<T, AttrName>>(settingName: Setting) {
      return controller.getPatcherSetting(attrName, settingName)
    },
    get attrName() {
      return attrName
    },
    get cached() {
      return patcher.getSetting('cached')
    },
    set cached(val: T[AttrName] | null) {
      patcher.setSetting('cached', val)
    },
    get errors() {
      return patcher.getSetting('errors')
    },
    set errors(val: string[]) {
      patcher.setSetting('errors', val)
    },
    get dirty() {
      return patcher.getSetting('dirty')
    },
    set dirty(val: boolean) {
      patcher.setSetting('dirty', val)
    },
    get patching() {
      return patcher.getSetting('patching')
    },
    set patching(val: boolean) {
      patcher.setSetting('patching', val)
    },
    get loaded() {
      const model = controller.x
      return isObject(model);
    },
    // Not to be called directly. This function handles the call to the server and subsequent update of the datastore.
    rawSet(val: T[AttrName]) {
      const client = globalOptions.client
      const model = controller.x || ({} as Partial<T>)
      const oldVal = model[patcher.attrName]
      if (oldVal === undefined) {
        console.error(`Cannot set undefined key on model. Attempted to set ${patcher.attrName} on ${patcher.controller.name}, ${JSON.stringify(patcher.controller.x)}`)
        return undefined
      }
      const data = {} as Partial<T>
      data[patcher.attrName] = val
      patcher.cancelController.abort()
      patcher.cancelController = new AbortController()
      patcher.errors = []
      if (controller.endpoint === '#') {
        // This is a special case where we're just using the single as scaffolding for storage.
        controller.updateX(data)
        this.dirty = false
        return
      }
      patcher.patching = true
      globalOptions.client.netCall<Partial<T>>({
        url: controller.endpoint,
        method: 'patch',
        data,
        signal: patcher.cancelController.signal,
      }).then((response) => client.deriveSingle<T>({response, state: controller.rawState})).then((response) => {
        controller.updateX(response)
        this.dirty = false
        this.patching = false
      }).catch(errorSend<T, AttrName>(patcher, globalOptions))
    },
    get model(): T[AttrName] {
      if (patcher.dirty) {
        return patcher.cached as unknown as T[AttrName]
      }
      return patcher.rawValue
    },
    set model(val: T[AttrName]) {
      patcher.set(val)
    },
    set(val: T[AttrName]) {
      patcher.cached = val
      if (patcher.cached === patcher.rawValue) {
        this.dirty = false
        return
      }
      this.dirty = true
      patcher.debouncedRawSet(val)
    },
    get rawValue(): any {
      let model = controller.x
      // Believe it or not, typeof null is 'object'.
      if (!isObject(model)) {
        return undefined
      }
      model = model as T
      const value = model[this.attrName]
      if (typeof value === 'object') {
        return cloneDeep(value)
      }
      return model[this.attrName]
    },
    // Include this initial value to satisfy type checker, but we'll need to replace it in a moment.
    debouncedRawSet: debounce(() => {  // eslint-disable-line @typescript-eslint/no-empty-function
    }),
    // We make a special JSON serialization here to avoid recursive loops when serializing
    toJSON: () => {
      return {attrName, controller: controller.name, moduleType: 'patcher', rawValue: patcher.rawValue}
    },
  }

  patcher.debouncedRawSet = debounce(patcher.rawSet, 250, {trailing: true})
  globalOptions.transformers.patcher(patcher)
  controller.initializePatcherSettings(attrName)
  return patcher
}
