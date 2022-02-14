import {BaseModule} from './BaseModule'
import {BaseController} from './BaseController'
import {Patcher} from '../singles/types/Patcher'

/**
 * The transformers are a set of functions that adapt the internal structure of Providence objects into something
 * the client state management libraries can use. Unless you're writing a plugin to support a new state management
 * backend, you should not need to specify these manually. The existing plugin should specify them for you.
 *
 * However, there may be some edge case, for testing or other instrumentation, where you need to spy on relevant calls
 * on all controllers, or otherwise transform their data. You can do so here if you need such functionality.
 */
export interface Transformers {
  /**
   * Transforms a providence module into a pluggable format the target state manager will understand.
   *
   * @param module Any dynamically generated module, such as a Single, that is built by
   * Providence.
   */
  module: <T extends BaseModule<any, any, any>>(module: T) => T,
  /**
   * Transforms a generated providence controller in any way necessary to provide its essential functions to the
   * target state manager.
   *
   * @param controller Any dynamically generated controller, such as a SingleController, that is built by
   * Providence.
   */
  controller: <T extends BaseController<any>>(controller: T) => T,
  /**
   * Transforms a generated patcher in any way necessary to provide its essential functions to the target state
   * manager.
   *
   * @param patcher A dynamically generated Patcher.
   */
  patcher: <T extends Patcher<any, any>>(patcher: T) => T,
}