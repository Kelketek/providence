import {AnySlicer} from '../../types/AnySlicer'
import {GlobalOptions} from '../../types/GlobalOptions'

/**
 * This configuration object is handed to [Drivers.makeModule](../interfaces/types_Drivers.Drivers.md#makemodule)'s
 * output function, adding a new module to the upstream library's store.
 */
export interface MakeModuleOptions<Module extends AnySlicer> {
  name: string,
  baseModule: ReturnType<ReturnType<Module['factory']>>,
  globalOptions: GlobalOptions,
}
