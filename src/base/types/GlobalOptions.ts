/**
The GlobalOptions interface contains the configuration options for Providence.
 */
import {NetCallOptions} from './NetCallOptions'
import {AxiosError} from 'axios'
import {FormErrorSet} from '../forms/types/FormErrorSet'
import {Transformers} from './Transformers'

/**
 * The GlobalOptions object is used to provide context to Providence. Most of the settings (especially those of the
 * transformers) should be provided automatically by the plugin for your state manager. However, attributes like
 * :js:attr:`netCall`, should be overwritten to include context (such as authentication headers)
 * specific to your environment.
 */
export interface GlobalOptions {
  /**
   * Utility function for network requests. Make your own version of this function with whatever
   * headers are required to make network requests to your API endpoints.
   *
   * A default implementation, :js:func:`baseCall`, is available.
   */
  netCall<T, K = T>(opts: NetCallOptions<T>): Promise<K>,
  /**
   * A function that takes an error raised by netCall and returns a FormErrorSet.
   *
   * @param val An error raised by netCall when making a network request.
   */
  deriveErrors: <T>(val: AxiosError, knownFields: Array<keyof T>) => FormErrorSet,
  transformers: Transformers,
}