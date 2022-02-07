import {BaseModule} from '../base/types/BaseModule'
import {IModuleStore} from 'redux-dynamic-modules'
import BaseProxyStore from '../base/types/BaseProxyStore'

// Adapter object that translates the defined parts of a module into something the
// target state manager (redux) can understand.
export const proxyMaker = (store: IModuleStore<any>) => {
  return <ModuleDefinition extends BaseModule<any, any, any>>({name, baseModule}: {name: string, baseModule: ModuleDefinition}) => {
    const proxy: BaseProxyStore<ModuleDefinition> = {
      get state() {
        return store.getState()[name] as ModuleDefinition['state']
      },
      attr(attrName) {
        return proxy.state[attrName]
      },
      commit(funcName, ...payload) {
        (store.dispatch({type: `${name}/${funcName}`, payload: payload[0]}))
      },
      dispatch(funcName, ...payload) {
        return baseModule['tasks'][funcName]({commit: proxy.commit, dispatch: proxy.dispatch, state: store.getState()[name], payload: payload[0]})
      }
    }
    return proxy
  }
}