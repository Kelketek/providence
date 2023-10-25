import {BaseModule} from '@opencraft/providence/base/types/BaseModule'

/**
 * Transforming function that translates the redux internal dispatch actions into functions that are compatible
 * with Providence's mutations. When Redux Dynamic Modules binds the mutations as reducers, the arguments aren't
 * quite the same as our mutations expect, so we translate them here in a way that preserves the original typing
 * elsewhere in the code.
 */
export const moduleTransformer = <T extends BaseModule<any, any, any>>(module: T): T => {
  for (const sourceFuncName of Object.keys(module.mutations)) {
    const original = module.mutations[sourceFuncName]
    module.mutations[sourceFuncName] = (state: any, action: any) => {
      original(state, action.payload)
    }
  }
  for (const sourceFuncName of Object.keys(module.tasks)) {
    const original = module.tasks[sourceFuncName]
    module.tasks[sourceFuncName] = (context: any) => {
      const payload = context.payload
      delete context[payload]
      return original(context, payload)
    }
  }
  return module
}
