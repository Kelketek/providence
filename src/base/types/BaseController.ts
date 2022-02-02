import BaseProxyStore from './BaseProxyStore'
import {AnyModule} from './AnyModule'

/*
Controllers are the public interface for interacting with providence modules in your
store of choice. There will only ever be one controller per registered module, thanks
to the registry. The controller should not hold information that can't be reconstructed
upon hot reload. It should merely be an interface for manipulating the registered module.
 */
export interface BaseController<ModuleDefinition extends AnyModule> {
  name: string,
  namespace: string[],
  attr: BaseProxyStore<ModuleDefinition>['attr'],
  commit: BaseProxyStore<ModuleDefinition>['commit'],
  dispatch: BaseProxyStore<ModuleDefinition>['dispatch'],
  preDestroy: () => void
}