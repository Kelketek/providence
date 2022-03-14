import {QueryParams} from '../types/QueryParams'
import ErrorTracking from '../types/ErrorTracking'
import FetchableState from '../types/FetchableState'
import {FetchableMutations} from '../types/FetchableMutations'
import cloneDeep from 'lodash/cloneDeep'
import {FetchableControllerProperties} from '../types/FetchableControllerProperties'
import {BaseController} from '../types/BaseController'
import {BaseState} from '../types/BaseState'
import {BaseModule} from '../types/BaseModule'

/**
 *  Common mutations between singles and lists.
 */
export const fetchableModule = <T extends FetchableState>(): FetchableMutations<T> => {
  const cancel = {controller: new AbortController()}
  return {
    kill() {
      // This function doesn't mutate stored state, but also does not rely on any promises, so it's built as a
      // mutation to make more clear its immediate return contract.
      //
      // It does, however, mutate some internal state for the module since the abort controller needs to be
      // regenerated for each request.
      cancel.controller.abort()
      cancel.controller = new AbortController()
    },
    // Most of the following functions are pretty self-explanatory-- they change meta attributes of the singleton.
    setEndpoint(state: T, endpoint: string) {
      state.endpoint = endpoint
    },
    setReady(state: T, val: boolean) {
      state.ready = val
    },
    setFailed(state: T, val: boolean) {
      state.failed = val
    },
    setFetching(state: T, val: boolean) {
      state.fetching = val
    },
    setParams(state: T, params: QueryParams | null) {
      if (params === null) {
        state.params = null
        return
      }
      state.params = {...params}
    },
    setErrors(state: T, errors: ErrorTracking) {
      state.errors = errors
    },
    resetErrors(state: T) {
      state.errors = {status: '', messages: []}
    },
  }
}

/**
 * Common functions/properties for Fetchable controllers.
 */
export const fetchableProperties = <
  Controller extends BaseController<BaseModule<BaseState & FetchableState, any, any>>
>(controller: Controller): FetchableControllerProperties => {
  return {
    get endpoint() {
      return controller.attr('endpoint')
    },
    set endpoint(val: string) {
      controller.commit('setEndpoint', val)
    },
    get ready() {
      return controller.attr('ready')
    },
    set ready(val: boolean) {
      controller.commit('setReady', val)
    },
    get failed() {
      return controller.attr('failed')
    },
    set failed(val: boolean) {
      controller.commit('setFailed', val)
    },
    get fetching() {
      return controller.attr('fetching')
    },
    set fetching(val: boolean) {
      controller.commit('setFetching', val)
    },
    get params() {
      return controller.attr('params')
    },
    set params(val: QueryParams | null) {
      controller.commit('setParams', val)
    },
    getOnce() {
      controller.dispatch('getOnce')
    },
    get errors() {
      return cloneDeep(controller.attr('errors'))
    },
    set errors(errors: ErrorTracking) {
      controller.commit('setErrors', errors)
    },
    resetErrors() {
      controller.commit('resetErrors')
    },
  }
}