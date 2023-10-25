import {IModuleStore} from 'redux-dynamic-modules'
import {useContext, useLayoutEffect, useMemo} from 'react'
import {useSelector, useStore} from 'react-redux'
import {v4 as randomUUID} from 'uuid'
import {SingleModule} from '@opencraft/providence/base/singles'
import {SingleModuleOptions} from '@opencraft/providence/base/singles/types/SingleModuleOptions'
import {SingleController} from '@opencraft/providence/base/singles/types/SingleController'
import {BaseSingleModule} from '@opencraft/providence/base/singles/types/BaseSingleModule'
import {ListModule} from '@opencraft/providence/base/lists'
import {ListModuleOptions} from '@opencraft/providence/base/lists/types/ListModuleOptions'
import {BaseListModule} from '@opencraft/providence/base/lists/types/BaseListModule'
import {ListController} from '@opencraft/providence/base/lists/types/ListController'
import {FormModule} from '@opencraft/providence/base/forms'
import {FormModuleOptions} from '@opencraft/providence/base/forms/types/FormModuleOptions'
import {BaseFormModule} from '@opencraft/providence/base/forms/types/BaseFormModule'
import {FormController} from '@opencraft/providence/base/forms/types/FormController'
import {BaseModuleOptions} from '@opencraft/providence/base/types/BaseModuleOptions'
import {defaultSpacer, getController} from '@opencraft/providence/base/registry'
import {AnyModule} from '@opencraft/providence/base/types/AnyModule'
import {AnySlicer} from '@opencraft/providence/base/types/AnySlicer'
import {BaseController} from '@opencraft/providence/base/types/BaseController'
import {ProvidenceContext} from './context'


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


const useSingleBase = buildUseInterface<typeof SingleModule, SingleModuleOptions<any>, BaseSingleModule<any>, SingleController<any>>(SingleModule)
const useListBase = buildUseInterface<typeof ListModule, ListModuleOptions<any>, BaseListModule<any>, ListController<any>>(ListModule)
const useFormBase = buildUseInterface<typeof FormModule, FormModuleOptions<any>, BaseFormModule<any>, FormController<any>>(FormModule)

// Last bit of coercing to make sure the controller always has the right typings when coming out.
export const useSingle = <T,>(name: string[] | string, options: Omit<SingleModuleOptions<T>, 'name'>): SingleController<T> => {
  return useSingleBase(name, options)
}

// Same here, but for lists.
export const useList = <T,>(name: string[] | string, options: Omit<ListModuleOptions<T>, 'name'>): ListController<T> => {
  return useListBase(name, options)
}

// And here for forms.
export const useForm = <T,>(name: string[] | string, options: Omit<FormModuleOptions<T>, 'name'>): FormController<T> => {
  return useFormBase(name, options)
}
