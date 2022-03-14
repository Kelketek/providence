import {AnySlicer} from './AnySlicer'
import {MakeModuleOptions} from '../registry/types/MakeModuleOptions'

export type ModuleFactory = <Slicer extends AnySlicer>(options: MakeModuleOptions<Slicer>) => () => void
