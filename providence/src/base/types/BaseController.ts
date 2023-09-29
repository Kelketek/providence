import BaseProxyStore from './BaseProxyStore'
import {AnyModule} from './AnyModule'

/**
Controllers are the public interface for interacting with providence modules in your
store of choice. There will only ever be one controller per registered module, thanks
to the registry. The controller should not hold information that can't be reconstructed
upon hot reload. It should merely be an interface for manipulating the registered module.
 */
export interface BaseController<ModuleDefinition extends AnyModule> {
  /**
   * An internal ID used to track this controller as a listener of single modules.
   *
   * @private
   */
  uid: string,
  /**
   * The name of the dynamically created module. This is a dot separated name. You can construct an escaped, valid
   * name with use of the [flattenNamespace](../functions/lib.flattenNamespace.md) function.
   */
  name: string,
  /**
   * The raw state of the dynamically created module. This should be a copy so mutating the output doesn't affect
   * the state.
   */
  rawState: ModuleDefinition['state'],
  /**
   * Useful for when needing to walk through modules for an operation, namespace returns an array of strings
   * representing this module's location in the hierarchy.
   */
  namespace: string[],
  /**
   * Returns the names of all modules this module manages. For singles, that will only be the current module name.
   * For lists, it will be the current module name and all the names of the singles it manages.
   */
  managedNames: string[],
  /**
   * Retrieves a particular attribute from the state for this module.
   */
  attr: BaseProxyStore<ModuleDefinition>['attr'],
  /**
   * Commits a mutation for this module.
   */
  commit: BaseProxyStore<ModuleDefinition>['commit'],
  /**
   * Dispatches a task for this module.
   */
  dispatch: BaseProxyStore<ModuleDefinition>['dispatch'],
  /**
   * A function which is run after the controller is no longer needed (because all listeners have disconnected),
   * before it is removed from the store.
   */
  preDestroy: () => void
}
