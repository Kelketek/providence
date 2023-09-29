import {RegistryEntry} from './RegistryEntry'
import {AnyModule} from '../../types/AnyModule'
import {BaseController} from '../../types/BaseController'

export interface RegistryRoot<ModuleDefinition extends AnyModule, Controller extends BaseController<ModuleDefinition>> {
  [key: string]: RegistryEntry<ModuleDefinition, Controller>,
}