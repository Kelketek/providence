/*
Plugins should provide a 'store' object handed to action functions that contains objects in this shape. This shape
corresponds to functions used, or similar to, most state management libraries. Translation should be provided by this
store as needed thus the name 'ProxyStore'.
 */
import {BaseModule} from './BaseModule'
import {ParametersExceptFirst} from './ParametersExceptFirst'

export default interface BaseProxyStore<ModuleDefinition extends BaseModule<any, any, any>> {
  state: ModuleDefinition['state'],
  attr: <Key extends string & keyof ModuleDefinition['state']>(attrName: Key) => ModuleDefinition['state'][Key],
  commit: <Key extends string & keyof ModuleDefinition['mutations']>(funcName: Key, ...payload: ParametersExceptFirst<ModuleDefinition['mutations'][Key]>) => void,
  dispatch:
    (<Key extends string & keyof ModuleDefinition['tasks']>(funcName: Key, ...payload: ParametersExceptFirst<ModuleDefinition['tasks'][Key]>) => ReturnType<ModuleDefinition['tasks'][Key]>) |
    (<Key extends string & keyof ModuleDefinition['tasks']>(funcName: Key, ...payload: ParametersExceptFirst<ModuleDefinition['tasks'][Key]>) => ReturnType<ModuleDefinition['tasks'][Key]>)
}