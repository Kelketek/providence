import {GlobalOptions} from './GlobalOptions'
import {ControllerConstructorParams} from './ControllerConstructorParams'
import {AnyModule} from './AnyModule'
import {BaseController} from './BaseController'
import {ProvidenceRegistries} from '../registry/types/ProvidenceRegistries'

export interface ProvidenceSlicer<Name extends keyof ProvidenceRegistries, ConstructorParams, ModuleDefinition extends AnyModule, Controller extends BaseController<ModuleDefinition>> {
  name: Name,
  factory: (options: GlobalOptions) => (options: ConstructorParams) => ModuleDefinition,
  controllerFactory: (options: ControllerConstructorParams<ModuleDefinition>) => Controller
}