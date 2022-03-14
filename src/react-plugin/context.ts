import {createContext} from 'react'
import {moduleTransformer} from './helpers'
import {
  baseCall,
  baseDeriveErrors,
  baseDeriveList,
  baseDeriveSingle,
  baseInitializePagination,
  baseGetCurrentPage, baseSetCurrentPage, baseGetTotalPages
} from '../base/lib'
import {ProvidenceRegistries} from '../base/registry/types/ProvidenceRegistries'
import {IModule, IModuleStore} from 'redux-dynamic-modules'
import {AnySlicer} from '../base/types/AnySlicer'
import {MakeModuleOptions} from '../base/registry/types/MakeModuleOptions'
import {createSlice, ReducersMapObject} from '@reduxjs/toolkit'
import {GlobalOptions} from '../base/types/GlobalOptions'
import {makeProxyFactory} from './storeProxy'


export const makeModuleFactory = <T extends AnySlicer>(store: IModuleStore<any>) => {
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

export const defaultContextValues = (): GlobalOptions => {
  const registryRoot: ProvidenceRegistries = {single: {}, list: {}}
  return {
    client: {
      netCall: baseCall,
      deriveSingle: baseDeriveSingle,
      deriveList: baseDeriveList,
      deriveErrors: baseDeriveErrors,
      paginator: {
        initializePagination: baseInitializePagination,
        getCurrentPage: baseGetCurrentPage,
        setPage: baseSetCurrentPage,
        getTotalPages: baseGetTotalPages,
      }
    },
    transformers: {
      module: moduleTransformer,
      controller: (val) => val,
      patcher: (val) => val,
    },
    drivers: {makeModuleFactory, makeProxyFactory},
    // Use a function here to avoid the registry's updating triggering an update to all components globally.
    // Updates should be constrained to whatever components are listening to an updated slice.
    registries: () => registryRoot,
  }
}

export const ProvidenceContext = createContext<GlobalOptions>(defaultContextValues())