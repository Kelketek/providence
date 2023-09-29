import BaseProxyStore from './BaseProxyStore'
import {BaseModule} from './BaseModule'
import {ModuleFactory} from './ModuleFactory'

/**
 * BoundStore is a proxy object around the target library store. It is provided as the 'store' to target module tasks.
 */
export interface BoundStore<ModuleDefinition extends BaseModule<any, any, any>> {
  /**
   * Commit commits a state change to the underlying state management library.
   */
  commit: BaseProxyStore<ModuleDefinition>['commit'],
  /**
   * Dispatch runs a function which may have multiple commits-- this may be provided through the client library's task
   * management, or it may be an implementation all its own.
   */
  dispatch: BaseProxyStore<ModuleDefinition>['dispatch'],
  /**
   * A getter that returns the state of the current module.
   */
  state: ModuleDefinition['state'],
  /**
   * A function that allows you to get the state of another module.
   */
  stateFor: BaseProxyStore<ModuleDefinition>['stateFor'],
  /**
   * ModuleFactory function-- this function should create a new function in the underlying state library.
   */
  makeModule: ModuleFactory,
}