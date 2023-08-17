import BaseProxyStore from './BaseProxyStore'
import {BaseModule} from './BaseModule'
import {GlobalOptions} from './GlobalOptions'

export interface ControllerConstructorParams<ModuleDefinition extends BaseModule<any, any, any>> {
  store: BaseProxyStore<ModuleDefinition>,
  globalOptions: GlobalOptions,
}