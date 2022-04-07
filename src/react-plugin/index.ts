import {buildUseInterface} from './hooks'
import {SingleModule} from '../base/singles'
import {SingleModuleOptions} from '../base/singles/types/SingleModuleOptions'
import {SingleController} from '../base/singles/types/SingleController'
import {BaseSingleModule} from '../base/singles/types/BaseSingleModule'
import {ListModule} from '../base/lists'
import {ListModuleOptions} from '../base/lists/types/ListModuleOptions'
import {BaseListModule} from '../base/lists/types/BaseListModule'
import {ListController} from '../base/lists/types/ListController'
import {FormModule} from '../base/forms'
import {FormModuleOptions} from '../base/forms/types/FormModuleOptions'
import {BaseFormModule} from '../base/forms/types/BaseFormModule'
import {FormController} from '../base/forms/types/FormController'

const useSingleBase = buildUseInterface<typeof SingleModule, SingleModuleOptions<any>, BaseSingleModule<any>, SingleController<any>>(SingleModule)
const useListBase = buildUseInterface<typeof ListModule, ListModuleOptions<any>, BaseListModule<any>, ListController<any>>(ListModule)
const useFormBase = buildUseInterface<typeof FormModule, FormModuleOptions<any>, BaseFormModule<any>, FormController<any>>(FormModule)

// Last bit of coercing to make sure the controller always has the right typings when coming out.
export const useSingle = <T>(name: string[] | string, options: Omit<SingleModuleOptions<T>, 'name'>): SingleController<T> => {
  return useSingleBase(name, options)
}

// Same here, but for lists.
export const useList = <T>(name: string[] | string, options: Omit<ListModuleOptions<T>, 'name'>): ListController<T> => {
  return useListBase(name, options)
}

// And here for forms.
export const useForm = <T>(name: string[] | string, options: Omit<FormModuleOptions<T>, 'name'>): FormController<T> => {
  return useFormBase(name, options)
}
