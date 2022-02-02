import {AnySlicer} from '../../types/AnySlicer'

export interface MakeModuleOptions<Module extends AnySlicer> {
  name: string,
  baseModule: ReturnType<ReturnType<Module['factory']>>,
}