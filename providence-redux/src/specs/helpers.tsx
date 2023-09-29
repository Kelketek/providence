import {createStore, IModuleStore} from 'redux-dynamic-modules'
import {v4 as randomUUID} from 'uuid'
import {defaultContextValues, ProvidenceContext} from '../context'
import {ReactComponentElement, ReactNode} from 'react'
import {Provider} from 'react-redux'
import {GlobalOptions} from '@opencraft/providence/types/GlobalOptions'
import {render} from '@testing-library/react'
import {AnySlicer} from '@opencraft/providence/types/AnySlicer'
import {BaseModuleOptions} from '@opencraft/providence/types/BaseModuleOptions'
import {AnyModule} from '@opencraft/providence/types/AnyModule'
import {BaseController} from '@opencraft/providence/types/BaseController'
import {defaultSpacer, getController} from '@opencraft/providence/registry'
import {SingleModule} from '@opencraft/providence/singles'
import {SingleModuleOptions} from '@opencraft/providence/singles/types/SingleModuleOptions'
import {BaseSingleModule} from '@opencraft/providence/singles/types/BaseSingleModule'
import {SingleController} from '@opencraft/providence/singles/types/SingleController'
import {ListModule} from '@opencraft/providence/lists'
import {ListModuleOptions} from '@opencraft/providence/lists/types/ListModuleOptions'
import {BaseListModule} from '@opencraft/providence/lists/types/BaseListModule';
import {ListController} from '@opencraft/providence/lists/types/ListController'
import {FormModule} from '@opencraft/providence/forms'
import {FormModuleOptions} from '@opencraft/providence/forms/types/FormModuleOptions'
import {BaseFormModule} from '@opencraft/providence/forms/types/BaseFormModule'
import {FormController} from "@opencraft/providence/forms/types/FormController"

export type ContextRenderOptions = {root?: HTMLElement, context?: GlobalOptions, store?: IModuleStore<any>}

export const ctxRender = (ui: ReactComponentElement<any>, {context, store}: ContextRenderOptions) => {
  const builtContext = {...defaultContextValues(), ...context}
  const targetStore = store || createStore({})
  const wrapper = ({children}: {children: ReactNode}) => (
    <Provider store={targetStore}>
      <ProvidenceContext.Provider value={builtContext}>
        {children}
      </ProvidenceContext.Provider>
    </Provider>
  );
  return render(ui, {wrapper})
}

export type TestContext = {store: IModuleStore<any>, context: GlobalOptions}

/*
Builds a function which allows us to retrieve a controller outside the React lifecycle,
useful for testing.
 */
export const buildTestControllerFetcher = <
  ModuleType extends AnySlicer,
  ModuleOptions extends BaseModuleOptions,
  ModuleDefinition extends AnyModule,
  Controller extends BaseController<ModuleDefinition>
>(module: ModuleType) => {
  return (namespace: string[] | string, moduleOptions: Omit<ModuleOptions, 'name'>, {store, context}: TestContext): Controller => {
    // We create a unique identifier for each component. This identifier will remain with the component
    // until it is destroyed, enabling us to ensure we're tracking listeners correctly.
    const uid = randomUUID()
    const modifiedNamespace = defaultSpacer(module.name, namespace)
    const {controller} = getController<ModuleType, ModuleDefinition, Controller>({
      module,
      uid,
      namespace: modifiedNamespace,
      moduleOptions,
      globalOptions: context,
      makeModule: context.drivers.makeModuleFactory(store),
      makeProxy: context.drivers.makeProxyFactory(store),
    })
    return controller
  }
}

const useSingleBase = buildTestControllerFetcher<typeof SingleModule, SingleModuleOptions<any>, BaseSingleModule<any>, SingleController<any>>(SingleModule)
const useListBase = buildTestControllerFetcher<typeof ListModule, ListModuleOptions<any>, BaseListModule<any>, ListController<any>>(ListModule)
const useFormBase = buildTestControllerFetcher<typeof FormModule, FormModuleOptions<any>, BaseFormModule<any>, FormController<any>>(FormModule)

// Last bit of coercing to make sure the controller always has the right typings when coming out.
export const getSingle = <T,>(name: string[] | string, options: Omit<SingleModuleOptions<T>, 'name'>, testContext: TestContext): SingleController<T> => {
  return useSingleBase(name, options, testContext)
}

// Same here, but for lists.
export const getList = <T,>(name: string[] | string, options: Omit<ListModuleOptions<T>, 'name'>, testContext: TestContext): ListController<T> => {
  return useListBase(name, options, testContext)
}

// And here for forms.
export const getForm = <T,>(name: string[] | string, options: Omit<FormModuleOptions<T>, 'name'>, testContext: TestContext): FormController<T> => {
  return useFormBase(name, options, testContext)
}
