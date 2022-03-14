import {IModuleStore} from 'redux-dynamic-modules'
import {BaseModuleOptions} from './types/BaseModuleOptions'
import {useContext, useLayoutEffect, useMemo} from 'react'
import {useSelector, useStore} from 'react-redux'
import {ProvidenceContext} from './context'
import {v4 as randomUUID} from 'uuid'
import {defaultSpacer, getController} from '../base/registry'
import {AnyModule} from '../base/types/AnyModule'
import {AnySlicer} from '../base/types/AnySlicer'
import {BaseController} from '../base/types/BaseController'
import {ProvidenceReduxState} from './types/ProvidenceReduxState'


/* Builds a react hook that creates Redux-aware Providence controllers. */
export const buildUseInterface = <
  ModuleType extends AnySlicer,
  ModuleOptions extends BaseModuleOptions,
  ModuleDefinition extends AnyModule,
  Controller extends BaseController<ModuleDefinition>
>(module: ModuleType) => {
  return (namespace: string[] | string, moduleOptions: Omit<ModuleOptions, 'name'>): Controller => {
    // We create a unique identifier for each component. This identifier will remain with the component
    // until it is destroyed, enabling us to ensure we're tracking listeners correctly.
    const uid = useMemo(randomUUID, [])
    const context = useContext(ProvidenceContext)
    const store = useStore() as IModuleStore<any>
    const modifiedNamespace = defaultSpacer(module.name, namespace)
    // We use useMemo here to cache the controller results and avoid recomputing everything.
    const {controller, remover} = useMemo(() => getController<ModuleType, ModuleDefinition, Controller>({
      module,
      uid,
      namespace: modifiedNamespace,
      moduleOptions,
      globalOptions: context,
      makeModule: context.drivers.makeModuleFactory(store),
      makeProxy: context.drivers.makeProxyFactory(store),
    }), [])
    // This call will indicate to React what state we're watching for on the slice, and trigger
    // a rerender if it changes. This may need to be optimized in the future for lists, since it will include
    // all list items.
    useSelector((state: ProvidenceReduxState) => {
      const result: {[key: string]: Record<string, any>} = {}
      for (const name of controller.managedNames) {
        result[name] = state[name]
      }
      return result
    })
    useLayoutEffect(() => {
      // useLayoutEffect is used here instead of useEffect because useEffect is called async afterwards,
      // while useLayoutEffect is always called synchronously when its dependencies are met.
      //
      // This makes sure we never end up in a situation where the state is inconsistent.
      return () => {
        remover(uid)
      }
    }, [])
    return controller
  }
}