import BaseProxyStore from './BaseProxyStore'
import {BaseModule} from './BaseModule'

export interface BoundStore<ModuleDefinition extends BaseModule<any, any, any>> {
  commit: BaseProxyStore<ModuleDefinition>['commit'],
  dispatch: BaseProxyStore<ModuleDefinition>['dispatch'],
  state: ModuleDefinition['state'],
}