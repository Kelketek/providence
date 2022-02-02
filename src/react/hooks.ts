import {createSlice, ReducersMapObject} from '@reduxjs/toolkit'
import {IModule, IModuleStore} from 'redux-dynamic-modules'
import {BaseModuleOptions} from './types/BaseModuleOptions'
import {useContext, useLayoutEffect, useMemo} from 'react'
import {useStore, useSelector} from 'react-redux'
import {ProvidenceContext} from './context'
import {randomUUID} from 'crypto'
import {proxyMaker} from './storeProxy'
import {defaultSpacer, getController} from '../base/registry/registry'
import {MakeModuleOptions} from '../base/registry/types/MakeModuleOptions'
import {AnyModule} from '../base/types/AnyModule'
import {AnySlicer} from '../base/types/AnySlicer'
import {BaseController} from '../base/types/BaseController'
import {ProvidenceReduxState} from './types/ProvidenceReduxState'


export const moduleMaker = <T extends AnySlicer>(store: IModuleStore<any>) => {
  /*
  Registers a module composed by Providence into the Dynamic Redux Module store.

  Returns a function that will remove that module.
   */
  return ({name, baseModule}: MakeModuleOptions<T>): () => void => {
    const slice = createSlice({
      name,
      initialState: baseModule.state,
      reducers: baseModule.mutations,
    })
    const iModule: IModule<T> = {
      id: name,
      reducerMap: {
        [name]: slice.reducer,
      } as ReducersMapObject,
    }
    return store.addModule(iModule).remove
  }
}

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
      globalOptions: context.options,
      registries: context.registries,
      makeModule: moduleMaker<ModuleType>(store),
      makeProxy: proxyMaker(store),
    }), [])
    // This call will indicate to React what state we're watching for on the slice, and trigger
    // a rerender if it changes.
    useSelector((state: ProvidenceReduxState) => state[controller.name])
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