import {GlobalOptions} from '../types/GlobalOptions'
import {SingleModuleOptions} from './types/SingleModuleOptions'
import {SingleState} from './types/SingleState'
import {BaseSingleModule} from './types/BaseSingleModule'
import {ProvidenceSlicer} from '../types/ProvidenceSlicer'
import {NetCallOptions} from '../types/NetCallOptions'
import {BoundStore} from '../types/BoundStore'
import {singleControllerFactory} from './controller'
import {SingleController} from './types/SingleController'
import {initialPatcherState} from './patcher'
import {FieldUpdate} from './types/FieldUpdate'
import {PatchersRoot} from './types/PatchersRoot'
import {PatcherState} from './types/PatcherState'
import ErrorTracking from '../types/ErrorTracking'
import {AxiosError} from 'axios'
import {fetchableModule} from '../lib/fragments'


export const singleDefaults = () => {
  return {
    x: null,
    endpoint: '#',
    persistent: false,
    fetching: false,
    ready: false,
    failed: false,
    deleted: false,
    params: null,
    patchers: {},
    errors: {status: '', messages: []}
  }
}

// Adds initial patcher settings to state from runtime data if they don't already exist.
export const updatePatchers = <T extends object>(state: SingleState<T>, x: Partial<T>) => {
  for (const key of Object.keys(x)) {
    const item = key as keyof typeof x
    if (!state.patchers[item]) {
      state.patchers[item] = initialPatcherState<typeof x, typeof item>() as PatcherState<T, keyof typeof x>
    }
  }
}

export function buildSingle<T extends object>(globalOptions: GlobalOptions): (options: SingleModuleOptions<T>) => BaseSingleModule<T> {
  return (options: SingleModuleOptions<T>) => {
    // An AbortController is not something which can be serialized and referred to later.
    // We keep it here in a closure for internal use.
    //
    // This does mean that the cancel functionality might 'break' in the case of a hot reload,
    // but in most cases this should be fine, as it only happens in development.
    const cancel = {controller: new AbortController()}
    const defaults = singleDefaults()
    const initialState: SingleState<T> = {...defaults, ...options}
    if (initialState.x) {
      updatePatchers(initialState, initialState.x)
    }
    const module: BaseSingleModule<T> = {
      state: initialState,
      mutations: {
        ...fetchableModule<SingleState<T>>(),
        updateX(state: SingleState<T>, x: Partial<T>) {
          // Updates the singleton with a patch value.
          if (state.x === null) {
            throw Error('Cannot update a null singleton.')
          }
          Object.assign(state.x as T, x)
          updatePatchers(state, x)
        },
        setX(state: SingleState<T>, x: T | null) {
          // Completely replaces the singleton.
          state.x = x
          if (x) {
            updatePatchers(state, x)
          }
        },
        setDeleted(state: SingleState<T>, val: boolean) {
          state.deleted = val
        },
        initializePatcherSettings(state: SingleState<T>, attrName) {
          // Use this function if you need to add a patcher at runtime manually. In well-designed systems, this is
          // unlikely to be needed. This function does nothing if the attribute's patcher is already initialized.
          if (state['patchers'][attrName]) {
            return
          }
          state['patchers'][attrName] = initialPatcherState()
        },
        setPatcherSetting<AttrName extends keyof PatchersRoot<T>, Setting extends keyof PatcherState<T, AttrName>>(state: SingleState<T>, fieldUpdate: FieldUpdate<T, AttrName, Setting>) {
          // If you want to be sure that this state is available, you should call ensurePatcherSettings once you know
          // a property should exist. We do this in the patcher upon initialization. We also set it here for type safety
          // if it doesn't exist, but in practice, this 'if' statement should never evaluate true unless you're calling
          // this mutation directly instead of from the patcher.
          /* istanbul ignore if */
          (state['patchers'][fieldUpdate.attrName] as PatcherState<T, AttrName>)[fieldUpdate.settingName] = fieldUpdate.val
        }
      },
      tasks: {
        // The HTTP actions are implemented in an exclusive fashion, since otherwise you could end up with a weird
        // state as a result of an unrelated request. Thus, before performing any network calls, Providence kills
        // any outstanding ones for this module.
        //
        // We return a promise to satisfy typing, and return null from that promise always since we can't make any
        // guarantees, since the actual promise for this request could have been made in another call, and we
        // wouldn't have access to it. If there were some way to store and retrieve the promise, that would improve
        // the guarantees of this function, but no obvious serializable method exists.
        //
        // Furthermore, if there is an issue fetching a resource the first time, retrying becomes far more difficult
        // when all code which relied on calling 'getOnce' has to be found and reran. It is always better to react
        // to the value being set than to depend on firstRun executing correctly.
        async getOnce({state, dispatch}) {
          // Convenience function that runs the get command if it hasn't been run before.
          if (state.fetching || state.ready || state.failed) {
            return
          }
          // The primary use case for getOnce is to allow you to have a wrapping component fetch the resource and
          // then render once fetched, perhaps showing a loading spinner in the meantime. The wrapping component can
          // also show an error if it can't fetch the resource based on what's stored in the 'errors' field.
          dispatch('get').catch()
        },
        async get({state, commit}) {
          commit('kill')
          commit('setFetching', true)
          // get is the only function we automatically add error storage functionality for, since it's the
          // one that's going to be called when a page loads by default. This default error storage is mainly to help
          // with load-spinner components that will do an initial fetch and let the user know how it goes.
          //
          // If you need to store errors for other methods, you can use a custom .catch() for those cases. However,
          // in most cases you'll probably be handling that data in some special way anyway.
          commit('resetErrors')
          const getOptions: NetCallOptions<T> = {url: state.endpoint, method: 'get', signal: cancel.controller.signal, params: {}}
          if (state.params) {
            getOptions.params = {...state.params}
          }
          const client = globalOptions.client
          return client.netCall<T>(getOptions).then((response) => client.deriveSingle({response, state})).then((response) => {
            commit('setX', response)
            commit('setReady', true)
            commit('setFailed', false)
            commit('setFetching', false)
            return response
          }).catch((error: AxiosError) => {
            commit('setReady', false)
            commit('setFetching', false)
            commit('setFailed', true)
            const errorSet = globalOptions.client.deriveErrors(error, [])
            const errors: ErrorTracking = {
              status: (error.code || (error.response && error.response.status) || 'UNKNOWN') + '',
              messages: errorSet.messages,
            }
            commit('setErrors', errors)
            throw error
          })
        },
        async delete({state, commit}) {
          commit('kill')
          await globalOptions.client.netCall<null>({
            url: state.endpoint,
            method: 'delete',
            signal: cancel.controller.signal,
          })
          commit('setDeleted', true)
          commit('setReady', false)
          commit('setX', null)
        },
        async put({state, commit}, data: Partial<T> | undefined) {
          commit('kill')
          const client = globalOptions.client
          return client.netCall<Partial<T>, T>({
            url: state.endpoint,
            method: 'put',
            signal: cancel.controller.signal,
            data,
          }).then((response) => client.deriveSingle({response, state})).then((response) => {
            commit('setX', response)
            return response
          })
        },
        async patch({state, commit}, updates: Partial<T>) {
          commit('kill')
          const response = await globalOptions.client.netCall<Partial<T>, T>({
            url: state.endpoint,
            method: 'patch',
            data: updates,
            signal: cancel.controller.signal,
          }).then((response) => globalOptions.client.deriveSingle({response, state}))
          commit('setX', response)
          return response
        },
        // Post calls don't always conform to the data structure of the object being tracked.
        // They may have no data at all, or may be specific commands to the resource at the endpoint.
        async post<K, R>({state, commit}: BoundStore<BaseSingleModule<T>>, data: any) {
          commit('kill')
          return globalOptions.client.netCall<K, R>({
            url: state.endpoint,
            method: 'post',
            data,
            signal: cancel.controller.signal,
          })
        },
      }
    }
    return globalOptions.transformers.module(module)
  }
}

export const SingleModule: ProvidenceSlicer<'single', SingleModuleOptions<any>, BaseSingleModule<any>, SingleController<any>> = {
  name: 'single',
  factory: buildSingle,
  controllerFactory: singleControllerFactory,
}
