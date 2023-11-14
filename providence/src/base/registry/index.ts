/**
 * Providence performs much of its magic by keeping a registry of controllers behind the scenes.
 * These controllers should always be the same, or at least always handle the same data consistently,
 * so we work to only ever return one controller per registered name.
 */

import {BaseModule} from '../types/BaseModule'
import {BaseModuleOptions} from '../types/BaseModuleOptions'
import {GlobalOptions} from '../types/GlobalOptions'
import BaseProxyStore from '../types/BaseProxyStore'
import {buildNestedPath, createPath, explodeName, flattenNamespace, retrieveName} from '../lib'
import {RegistryRoot} from './types/RegistryRoot'
import {RegistryEntry} from './types/RegistryEntry'
import {MakeModuleOptions} from './types/MakeModuleOptions'
import {AnySlicer} from '../types/AnySlicer'
import {AnyModule} from '../types/AnyModule'
import {BaseController} from '../types/BaseController'
import { EntryRemover } from './types/EntryRemover'

export const defaultSpacer = (baseName: string, value: string | string[]): string[] => {
  if (typeof value === 'string') {
    return [baseName, value]
  }
  return value
}

/*
Add an entry to the registry. This entry may be partially constructed, since there are occasions when we'll want
to indicate that a component will 'listen' for a registered entry but not create the controller for it.

This might happen in the case that a parent component can swap out child components, and we don't want to re-register
the child component's entries each time they swap out.

One example might be a search page that loads a search term for several searchable types. Imagine
a music listening service that searches for albums, artists, and songs. If we are on the search page, we'll want
to listen for the components for all three of these, but we don't want to have to re-run the search each time we
swap subcomponents.

Note that overriding the 'children' entry here is not permitted for sanity reasons.
 */
export const registerOrUpdateEntry = <Module extends AnyModule, Controller extends BaseController<Module>>(registry: RegistryRoot<Module, Controller>, namespace: string[], entry: Partial<RegistryEntry<Module, Controller>>) => {
  const currentEntry = createPath<RegistryEntry<Module, Controller>>(registry, buildNestedPath(namespace, 'children'), () => ({
    children: {},
    listeners: []
  }))
  if (entry.listeners) {
    currentEntry.listeners = entry.listeners
  }
  if (entry.remover) {
    currentEntry.remover = entry.remover
  }
  if (entry.controller) {
    currentEntry.controller = entry.controller
  }
}
/*
Removes an entry from the registry.
 */
export const removeFromRegistry = <Module extends AnyModule, Controller extends BaseController<AnyModule>>(registry: RegistryRoot<Module, Controller>, namespace: string[]) => {
  const nestPath = buildNestedPath(namespace, 'children')
  const prePath = nestPath.slice(0, -1)
  const preEntry = retrieveName<RegistryEntry<Module, Controller>['children']>(registry, prePath)
  const finalName = nestPath[nestPath.length - 1]
  if (!(preEntry && preEntry[finalName])) {
    console.warn(`Tried to remove non-existent registry entry, ${JSON.stringify(namespace)}. Ignoring.`)
    return
  }
  const entry = preEntry[finalName]
  if (entry.listeners.length) {
    throw Error(`Cannot remove an entry that still has listening components! Tried to remove ${JSON.stringify(namespace)}, listeners were ${JSON.stringify(entry.listeners)}`)
  }
  delete entry.controller
  delete entry.remover
  if (Object.keys(entry.children).length) {
    return
  }
  delete preEntry[finalName]
}

export interface getControllerOptions<Slicer extends AnySlicer, Module extends BaseModule<any, any, any>> {
  module: Slicer,
  uid: string,
  namespace: string[],
  moduleOptions?: Omit<BaseModuleOptions, 'name'>,
  globalOptions: GlobalOptions,
  makeModule: (options: MakeModuleOptions<any>) => () => void,
  makeProxy: (options: MakeModuleOptions<any>) => BaseProxyStore<Module>,
}

/**
 * Arguments for RemoveListener
 */
declare interface RemoveListenerArgs {
  uid: string,
  registryRoot: RegistryRoot<any, any>,
  name: string,
}

/**
 * Removes a listening UID from the registry, and then returns `true` if there are any remaining listeners,
 * or `false` if no listeners remain.
 */
export const removeListener = ({uid, name, registryRoot}: RemoveListenerArgs) => {
  const namespace = explodeName(name)
  let {listeners} = retrieveName(
    registryRoot, buildNestedPath(namespace, 'children'),
    true,
  ) as RegistryEntry<AnyModule, any> || {listeners: undefined}
  /* istanbul ignore if */
  if (listeners === undefined) {
    console.warn(`Tried to remove listener for ${name} ${uid}, but registry entry is broken or missing.`)
    return false
  }
  listeners = listeners.filter((val: string) => val != uid)
  registerOrUpdateEntry(registryRoot, namespace, {listeners})
  return Boolean(listeners.length)
}

/*
Retrieves existing controllers from the relevant registry.
*/
export const getController = <
  Slicer extends AnySlicer,
  Module extends AnyModule,
  Controller extends BaseController<Module>
>(
  {
    module, uid, namespace, moduleOptions, globalOptions, makeModule,
    makeProxy,
  }: getControllerOptions<Slicer, Module>): {controller: Controller, remover: EntryRemover} => {
  const name = flattenNamespace(namespace)
  const registryRoot = globalOptions.registries()[module.name] as RegistryRoot<Module, Controller>
  const getModule = (namePath: string[]) => retrieveName<RegistryEntry<Module, Controller>>(
    registryRoot, buildNestedPath(namePath, 'children'),
    true,
  ) || {controller: undefined, remover: undefined, listeners: undefined}
  let {controller, remover, listeners} = getModule(namespace)
  if (!(remover && controller)) {
    if (!remover && !moduleOptions) {
      throw Error(
        `Attempted to retrieve a pre-existing ${module.name} module with name ${name}, but it could not be found!`,
      )
    }
    const baseModule = module.factory(globalOptions)({...moduleOptions, name})
    if (!remover) {
      remover = makeModule({baseModule, name, globalOptions})
    }
    if (!controller) {
      const moduleProxy = makeProxy({name, baseModule, globalOptions})
      controller = module.controllerFactory({store: moduleProxy, globalOptions: globalOptions})
    }
  }
  if (!listeners) {
    listeners = [uid]
  } else if (!listeners.includes(uid)) {
    listeners.push(uid)
  }
  // Note: if a controller already exists, remover will already be defined.
  // If a controller does not exist, remover will be defined.
  remover = remover as () => void
  controller = controller as Controller
  registerOrUpdateEntry<Module, Controller>(registryRoot, namespace, {listeners, controller, remover})
  const controllerBoundRemover = (uid: string) => {
    controller = controller as Controller
    const namespace = explodeName(controller.name)
    const listenersRemain = removeListener({uid, name: controller.name, registryRoot})
    if (!listenersRemain && !controller.attr('persistent')) {
      controller.preDestroy();
      (remover as () => void)()
      removeFromRegistry(registryRoot, namespace)
    }
  }
  return {controller, remover: controllerBoundRemover}
}
