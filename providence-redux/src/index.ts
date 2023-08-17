import {buildUseInterface} from './hooks'
import {SingleModule} from '@opencraft/providence/singles'
import {SingleModuleOptions} from '@opencraft/providence/singles/types/SingleModuleOptions'
import {SingleController} from '@opencraft/providence/singles/types/SingleController'
import {BaseSingleModule} from '@opencraft/providence/singles/types/BaseSingleModule'
import {ListModule} from '@opencraft/providence/lists'
import {ListModuleOptions} from '@opencraft/providence/lists/types/ListModuleOptions'
import {BaseListModule} from '@opencraft/providence/lists/types/BaseListModule'
import {ListController} from '@opencraft/providence/lists/types/ListController'
import {FormModule} from '@opencraft/providence/forms'
import {FormModuleOptions} from '@opencraft/providence/forms/types/FormModuleOptions'
import {BaseFormModule} from '@opencraft/providence/forms/types/BaseFormModule'
import {FormController} from '@opencraft/providence/forms/types/FormController'

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
