import {BaseModule} from './BaseModule'
import {BoundStore} from './BoundStore'

export type TaskFunction<ModuleDefinition extends BaseModule<any, any, any>> =
  ((store: BoundStore<ModuleDefinition>, params?: any) => void) |
  ((store: BoundStore<ModuleDefinition>, params?: any) => Promise<any>)
