import {BaseController} from './BaseController'
import {BaseModuleOptions} from './BaseModuleOptions'

export type UseController<ModuleOptions extends BaseModuleOptions, ControllerType extends BaseController<any>> = (namespace: string[] | string, moduleOpts: Omit<ModuleOptions, 'name'>) => ControllerType
