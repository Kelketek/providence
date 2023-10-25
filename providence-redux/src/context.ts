import {createContext} from 'react'
import {moduleTransformer} from './helpers'
import {
  baseCall,
  baseDeriveErrors,
  baseDeriveList,
  baseDeriveSingle,
  baseInitializePagination,
  baseGetCurrentPage,
  baseSetCurrentPage,
  baseGetTotalPages,
  baseDeriveForm,
} from '@opencraft/providence/base/lib'
import {ProvidenceRegistries} from '@opencraft/providence/base/registry/types/ProvidenceRegistries'
import {IModule, IModuleStore} from 'redux-dynamic-modules'
import {AnySlicer} from '@opencraft/providence/base/types/AnySlicer'
import {MakeModuleOptions} from '@opencraft/providence/base/registry/types/MakeModuleOptions'
import {createSlice, ReducersMapObject} from '@reduxjs/toolkit'
import {GlobalOptions} from '@opencraft/providence/base/types/GlobalOptions'
import {makeProxyFactory} from './storeProxy'
import {email} from '@opencraft/providence/base/forms/validators'


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
  const registryRoot: ProvidenceRegistries = {single: {}, list: {}, form: {}}
  return {
    client: {
      netCall: baseCall,
      deriveSingle: baseDeriveSingle,
      deriveList: baseDeriveList,
      deriveForm: baseDeriveForm,
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
      fielder: (val) => val,
    },
    validators: {
      email,
    },
    drivers: {makeModuleFactory, makeProxyFactory},
    // Use a function here to avoid the registry's updating triggering an update to all components globally.
    // Updates should be constrained to whatever components are listening to an updated slice.
    registries: () => registryRoot,
  }
}

export const ProvidenceContext = createContext<GlobalOptions>(defaultContextValues())
