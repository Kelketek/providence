import {BaseModule} from '@opencraft/providence/types/BaseModule'
import {IModuleStore} from 'redux-dynamic-modules'
import BaseProxyStore from '@opencraft/providence/types/BaseProxyStore'
import {GlobalOptions} from '@opencraft/providence/types/GlobalOptions'

declare type MakeProxyOptions<ModuleDefinition extends BaseModule<any, any, any>> = {
  name: string, baseModule: ModuleDefinition, globalOptions: GlobalOptions
}

// Adapter object that translates the defined parts of a module into something the
// target state manager (redux) can understand.
export const makeProxyFactory = (store: IModuleStore<any>) => {
  const makeProxy = <ModuleDefinition extends BaseModule<any, any, any>>({name, baseModule, globalOptions}: MakeProxyOptions<ModuleDefinition>) => {
    const proxy: BaseProxyStore<ModuleDefinition> = {
      moduleState() {
        return store.getState()[name]
      },
      attr(attrName) {
        return proxy.moduleState()[attrName]
      },
      commit(funcName, ...payload) {
        // Providence mutations should never include a / in the name, so this should never conflict.
        if (funcName.includes('/')) {
          store.dispatch({type: funcName, payload: payload[0]})
          return
        }
        store.dispatch({type: `${name}/${funcName}`, payload: payload[0]})
      },
      dispatch(funcName, ...payload) {
        return baseModule['tasks'][funcName]({
          commit: proxy.commit,
          dispatch: proxy.dispatch,
          state: proxy.moduleState(),
          payload: payload[0],
          makeModule: proxy.makeModule,
          stateFor: proxy.stateFor,
        })
      },
      stateFor(moduleName) {
        return store.getState()[moduleName]
      },
      // We don't have 'dispatchFor' as it will require some significant reworking, and so far we haven't needed it.

      // These functions are needed to allow modules to create more modules.
      makeModule: globalOptions.drivers.makeModuleFactory(store),
      makeProxy,
    }
    return proxy
  }
  return makeProxy
}
