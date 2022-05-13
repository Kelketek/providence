import {BaseModule} from './BaseModule'
import {BaseController} from './BaseController'
import {Patcher} from '../singles/types/Patcher'
import {Fielder} from '../forms/types/Fielder'


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
  /**
   * Transforms a generated fielder in any way necessary to provide its essential functions to the target state
   * manager.
   *
   * @param fielder A dynamically generated Fielder.
   */
  fielder: <T extends Fielder<any, any>>(patcher: T) => T,
}