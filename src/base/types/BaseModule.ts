import {BaseState} from './BaseState'

export interface BaseModule<ModuleState extends BaseState, ModuleMutations, ModuleTasks> {
  state: ModuleState,
  mutations: ModuleMutations,
  tasks: ModuleTasks,
}
