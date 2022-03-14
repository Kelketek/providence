import {MakeModuleOptions} from '../registry/types/MakeModuleOptions'
import BaseProxyStore from './BaseProxyStore'
import {AnySlicer} from './AnySlicer'
import {BaseModule} from './BaseModule'


export type StoreProxyFactory = <Module extends BaseModule<any, any, any>>(options: MakeModuleOptions<AnySlicer>) => BaseProxyStore<Module>