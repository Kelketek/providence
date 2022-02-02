import {buildUseInterface} from './hooks'
import {SingleModule} from '../base/singles'
import {SingleModuleOptions} from '../base/singles/types/SingleModuleOptions'
import {SingleController} from '../base/singles/types/SingleController'
import {BaseSingleModule} from '../base/singles/types/BaseSingleModule'

const useSingleBase = buildUseInterface<typeof SingleModule, SingleModuleOptions<any>, BaseSingleModule<any>, SingleController<any>>(SingleModule)

// Last bit of coercing to make sure the controller always has the right typings when coming out.
export const useSingle = <T>(name: string[] | string, options: Omit<SingleModuleOptions<T>, 'name'>): SingleController<T> => {
  return useSingleBase(name, options)
}