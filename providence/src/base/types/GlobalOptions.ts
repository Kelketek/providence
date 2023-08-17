/**
The GlobalOptions interface contains the configuration options for Providence.
 */
import {Transformers} from './Transformers'
import {Drivers} from './Drivers'
import {ProvidenceRegistries} from '../registry/types/ProvidenceRegistries'
import {ProvidenceClient} from './ProvidenceClient'
import {Validators} from '../forms/types/Validators'

/**
 * The GlobalOptions object is used to provide context to Providence. Most of the settings (especially those of the
 * transformers) should be provided automatically by the plugin for your state manager. However, some
 * :js:class:`client <ProvidenceClient>` functions may need customizing, and you'll want to set up your own
 * :ref:`validators <module_types/forms:Validators>` for any form field validation.
 */
export interface GlobalOptions {
  /**
   * The :js:class:`client <ProvidenceClient>` contains functions for contacting your API and deriving data from it.
   * In most cases you will want to customize at least the :js:attr:`netCall` function.
   *
   * A default implementation, :js:func:`baseCall`, is available.
   */
  client: ProvidenceClient,
  /**
   * The :js:class:`transformers <Transformers>` are a set of functions that adapt the internal structure of Providence
   * objects into something the client state management libraries can use. Unless you're writing a plugin to support a
   * new state management backend, you should not need to specify these manually. The existing plugin should specify
   * them for you.
   *
   * However, there may be some edge case, for testing or other instrumentation, where you need to spy on relevant calls
   * on all controllers, or otherwise transform their data. You can do so here if you need such functionality.
   */
  transformers: Transformers,
  /**
   * The :js:class:`drivers <Drivers>` are the means by which we perform meta-operations with the client store, like
   * adding or removing a module. You should not have to set these settings unless you're making your own state
   * management library adapter.
   */
  drivers: Drivers,
  /**
   * A function which returns the registries' singleton. We make this a function so it can be ignored as a dependency
   * more easily by reactive client frameworks-- otherwise we might have infinite loop changes.
   */
  registries: () => ProvidenceRegistries,
  /**
   * The set of validators used for field validation. By default, only the example 'email' validator is included.
   * Each key in this object will be used as a reference name for the :ref:`validators <module_types/forms:Validators>`
   * on a field.
   */
  validators: Validators,
}