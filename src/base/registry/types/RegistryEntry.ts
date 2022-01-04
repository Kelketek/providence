import {BaseController} from '../../types/BaseController'
import {EntryRemover} from './EntryRemover'
import {AnyModule} from '../../types/AnyModule'

export interface RegistryEntry<ModuleDefinition extends AnyModule, Controller extends BaseController<ModuleDefinition>> {
  children: {[key: string]: RegistryEntry<ModuleDefinition, Controller>},
  controller?: Controller,
  remover?: EntryRemover,
  listeners: string[],
}