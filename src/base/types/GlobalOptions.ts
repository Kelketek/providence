/**
The GlobalOptions interface contains the configuration options for Providence.
 */
import {Transformers} from './Transformers'
import {Drivers} from './Drivers'
import {ProvidenceRegistries} from '../registry/types/ProvidenceRegistries'
import {ProvidenceClient} from './ProvidenceClient'

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
  client: ProvidenceClient,
  transformers: Transformers,
  drivers: Drivers,
  registries: () => ProvidenceRegistries,
}