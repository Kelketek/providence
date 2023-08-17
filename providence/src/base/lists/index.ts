import {GlobalOptions} from '../types/GlobalOptions'
import {ListModuleOptions} from './types/ListModuleOptions'
import {ListState} from './types/ListState'
import {AxiosError} from 'axios'
import {NetCallOptions} from '../types/NetCallOptions'
import ErrorTracking from '../types/ErrorTracking'
import {buildNestedPath, explodeName, flattenNamespace, retrieveName} from '../lib'
import {BaseListModule} from './types/BaseListModule'
import {BoundStore} from '../types/BoundStore'
import {ProvidenceSlicer} from '../types/ProvidenceSlicer'
import {listControllerFactory} from './controller'
import {ListController} from './types/ListController'
import {fetchableModule} from '../lib/fragments'
import {singleDefaults, SingleModule} from '../singles'
import {registerOrUpdateEntry, removeListener} from '../registry'
import {BaseSingleModule} from '../singles/types/BaseSingleModule'
import {PageInfo} from './types/PageInfo'
import {RegistryEntry} from "../registry/types/RegistryEntry";


declare interface AddModulesArgs<T> {
  globalOptions: GlobalOptions,
  state: BoundStore<BaseListModule<T>>['state'],
  commit: BoundStore<BaseListModule<T>>['commit'],
  makeModule: BoundStore<BaseListModule<T>>['makeModule'],
  stateFor: BoundStore<BaseListModule<T>>['stateFor'],
  entries: T[],
}


const addModules = <T>({globalOptions, state, makeModule, commit, entries, stateFor}: AddModulesArgs<T>): string[] => {
  let append = ''
  if (state.endpoint[state.endpoint.length - 1] === '/') {
    append = '/'
  }
  const registryRoot = globalOptions.registries().single
  const refs: string[] = []
  for (const entry of entries) {
    const namespace = [...explodeName(state.name), `${entry[state.keyProp]}`]
    const name = flattenNamespace(namespace)
    refs.push(name)
    if (stateFor(name)) {
      commit<BaseSingleModule<T>, 'setX'>(`${name}/setX`, entry)
    }
    if (state.refs.includes(name)) {
      // There is a small chance the client developer has been hanging on to a previous copy of this module
      // and so it hasn't yet been garbage collected.
      continue
    }
    const moduleOptions = {
      ...singleDefaults(),
      name,
      endpoint: `${state.endpoint}${entry[state.keyProp]}${append}`,
      ready: true,
      x: entry,
    }
    const baseModule = SingleModule.factory(globalOptions)(moduleOptions)
    // This conditional in case the aforementioned non-garbage-collected entry exists.
    const {remover, listeners} = (
      retrieveName<T>(registryRoot, buildNestedPath(namespace, 'children'), true) as RegistryEntry<any, any>
      || {remover: makeModule({baseModule, name, globalOptions}), listeners: []}
    )
    listeners.push(state.name)
    registerOrUpdateEntry(registryRoot, namespace, {remover, listeners})
  }
  return refs
}


export function buildList<T extends object>(globalOptions: GlobalOptions): (options: ListModuleOptions<T>) => BaseListModule<T> {
  return (options: ListModuleOptions<T>) => {
    // An AbortController is not something which can be serialized and referred to later.
    // We keep it here in a closure for internal use.
    //
    // This does mean that the cancel functionality might 'break' in the case of a hot reload,
    // but in most cases this should be fine, as it only happens in development.
    const cancel = {controller: new AbortController()}
    const defaults = {
      grow: false,
      endpoint: '#',
      pageInfo: null,
      refs: [],
      persistent: false,
      ready: false,
      keyProp: 'id' as keyof T,
      fetching: false,
      reverse: false,
      failed: false,
      paginated: true,
      params: null,
      errors: {status: '', messages: []}
    }
    let initialState: ListState<T> = {...defaults, ...options}
    if (initialState.paginated) {
      initialState = globalOptions.client.paginator.initializePagination(initialState)
    }
    const module: BaseListModule<T> = {
      state: initialState,
      mutations: {
        ...fetchableModule<ListState<T>>(),
        setRefs(state, refs) {
          state.refs = refs
        },
        setPageInfo(state, pageSettings: PageInfo | null) {
          state.pageInfo = pageSettings
        },
        setGrow(state: ListState<T>, val: boolean) {
          state.grow = val
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
          dispatch('get').catch(() => undefined)
        },
        setList({state, makeModule, commit, stateFor}, entries: T[]) {
          // Follow the slash convention of the existing endpoint. This could be made into a transformation function
          // if there's enough demand from client developers.
          const refs = addModules({globalOptions, makeModule, commit, state, entries, stateFor})
          const toRemove = state.refs.filter((name) => !refs.includes(name))
          for (const name of toRemove) {
            const listenersRemain = removeListener({uid: state.name, registryRoot: globalOptions.registries().single, name})
            // If controllers exist, they'll need to perform the cleanup. But if they don't, we do. Since both the
            // controllers and the list module directly both register as listeners, the module should never be destroyed
            // before it's properly abandoned.
            const targetState = stateFor<BaseSingleModule<T>>(name)
            if (!listenersRemain && !(targetState && targetState.persistent)) {
              const {remover} = retrieveName(
                globalOptions.registries().single, buildNestedPath(explodeName(name), 'children'),
                true,
              ) as RegistryEntry<BaseListModule<T>, ListController<T>> || {remover: undefined}
              if (remover) {
                remover()
              } else {
                console.warn(`Attempted to remove list item ${name}, but it was already removed!`)
              }
            }
          }
          commit('setRefs', refs)
          return entries
        },
        prefix({state, makeModule, commit, stateFor}, entries: T[]) {
          const refs = addModules({globalOptions, state, makeModule, commit, stateFor, entries})
          commit('setRefs', [...refs, ...state.refs])
        },
        extend({state, makeModule, commit, stateFor}, entries: T[]) {
          const refs = addModules({globalOptions, state, makeModule, commit, stateFor, entries})
          commit('setRefs', [...state.refs, ...refs])
        },
        async get({state, commit, dispatch}) {
          commit('kill')
          commit('setFetching', true)
          // get is the only function we automatically add error storage functionality for, since it's the
          // one that's going to be called when a page loads by default. This default error storage is mainly to help
          // with load-spinner components that will do an initial fetch and let the user know how it goes.
          //
          // If you need to store errors for other methods, you can use a custom .catch() for those cases. However,
          // in most cases you'll probably be handling that data in some special way anyway.
          commit('resetErrors')
          const getOptions: NetCallOptions<T[]> = {url: state.endpoint, method: 'get', signal: cancel.controller.signal, params: {}}
          if (state.params) {
            getOptions.params = {...state.params}
          }
          const client = globalOptions.client
          return client.netCall<T[]>(getOptions).then((response) => client.deriveList<T>({response, state})).then(async (response) => {
            let results = response.list
            if (state.reverse) {
              results = response.list.reverse()
            }
            if (state.grow) {
              if (state.reverse) {
                dispatch('prefix', results)
              } else {
                dispatch('extend', results)
              }
            } else {
              dispatch('setList', results)
            }
            commit('setPageInfo', response.pageInfo)
            commit('setReady', true)
            commit('setFailed', false)
            commit('setFetching', false)
            return results
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
        // Post calls don't always conform to the data structure of the object being tracked.
        // They may have no data at all, or may be specific commands to the resource at the endpoint.
        async post<K, R>({state, commit}: BoundStore<BaseListModule<T>>, data: any) {
          commit('kill')
          return globalOptions.client.netCall<K, R>({
            url: state.endpoint,
            method: 'post',
            data,
            signal: cancel.controller.signal,
          })
        },
        makeReady({dispatch, commit}, payload: T[]) {
          // Need to register singles here.
          dispatch('setList', payload)
          commit('setReady', true)
          return payload
        }
      }
    }
    return globalOptions.transformers.module(module)
  }
}

export const ListModule: ProvidenceSlicer<'list', ListModuleOptions<any>, BaseListModule<any>, ListController<any>> = {
  name: 'list',
  factory: buildList,
  controllerFactory: listControllerFactory,
}
