/*
Plugins should provide a 'store' object handed to action functions that contains objects in this shape. This shape
corresponds to functions used, or similar to, most state management libraries. Translation should be provided by this
store as needed thus the name 'ProxyStore'.
 */
import {BaseModule} from './BaseModule'
import {ParametersExceptFirst} from './ParametersExceptFirst'
import {ModuleFactory} from './ModuleFactory'
import {MakeModuleOptions} from '../registry/types/MakeModuleOptions'
import {AnySlicer} from './AnySlicer'
import {AnyModule} from './AnyModule'

export default interface BaseProxyStore<ModuleDefinition extends BaseModule<any, any, any>> {
  moduleState: () => ModuleDefinition['state'],
  attr: <Key extends string & keyof ModuleDefinition['state']>(attrName: Key) => ModuleDefinition['state'][Key],
  commit<OutsideModuleDefinition extends BaseModule<any, any, any> = ModuleDefinition, Key extends string & keyof OutsideModuleDefinition['mutations'] = string & keyof OutsideModuleDefinition['mutations']>(funcName: Key | `${string}/${Key}`, ...payload: ParametersExceptFirst<OutsideModuleDefinition['mutations'][Key]>): void;
  stateFor: <OutsideModuleDefinition extends BaseModule<any, any, any>>(moduleName: string) => OutsideModuleDefinition['state'],
  dispatch:
    (<Key extends string & keyof ModuleDefinition['tasks']>(funcName: Key, ...payload: ParametersExceptFirst<ModuleDefinition['tasks'][Key]>) => ReturnType<ModuleDefinition['tasks'][Key]>) |
    (<Key extends string & keyof ModuleDefinition['tasks']>(funcName: Key, ...payload: ParametersExceptFirst<ModuleDefinition['tasks'][Key]>) => ReturnType<ModuleDefinition['tasks'][Key]>),
  makeModule: ModuleFactory,
  makeProxy(options: MakeModuleOptions<AnySlicer>): BaseProxyStore<AnyModule>
}