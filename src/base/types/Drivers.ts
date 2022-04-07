import {ModuleFactory} from './ModuleFactory'
import {StoreProxyFactory} from './StoreProxyFactory'

export interface Drivers {
  /**
   * The `makeModuleFactory` function should take the upstream library's store, whatever shape it may come in, and
   * create a function which allows you to add a module to this store, if given a :js:class:`MakeModuleOptions`
   * object.
   *
   * This function should return a function, which takes no arguments and returns nothing, that will remove the
   * module from the store.
   */
  makeModuleFactory: (store: any) => ModuleFactory,
  /**
   * The `makeProxyFactory` function should take the upstream library's store, whatever shape it may come in, and
   * create a function which builds a proxy :js:class:`BoundStore` if given a :js:class:`MakeModuleOptions` object.
   */
  makeProxyFactory: (store: any) => StoreProxyFactory
}