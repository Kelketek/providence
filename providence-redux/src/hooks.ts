import {IModuleStore} from 'redux-dynamic-modules'
import {useContext, useLayoutEffect, useMemo} from 'react'
import {useSelector, useStore} from 'react-redux'
import {ProvidenceContext} from './context'
import {v4 as randomUUID} from 'uuid'
import {BaseModuleOptions} from '@opencraft/providence/types/BaseModuleOptions'
import {defaultSpacer, getController} from '@opencraft/providence/registry'
import {AnyModule} from '@opencraft/providence/types/AnyModule'
import {AnySlicer} from '@opencraft/providence/types/AnySlicer'
import {BaseController} from '@opencraft/providence/types/BaseController'


/* Builds a React hook that creates Redux-aware Providence controllers. */
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
    // a rerender if it changes. We only check if the immediate controller has updated state-- any managed
    // controllers will not trigger an update here, except when added or removed.
    useSelector(() => {
      // Make it a string so that it's treated as the same object (=== equality check on React's end) and thus
      // does not trigger a rerender.
      return JSON.stringify(controller.rawState)
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
