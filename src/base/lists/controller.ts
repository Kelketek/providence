import BaseProxyStore from '../types/BaseProxyStore'
import {GlobalOptions} from '../types/GlobalOptions'
import {completeAssign, explodeName} from '../lib'
import {BaseListModule} from './types/BaseListModule'
import {ListController} from './types/ListController'
import {v4 as randomUUID} from 'uuid'
import {getController} from '../registry'
import {SingleModule} from '../singles'
import {BaseSingleModule} from '../singles/types/BaseSingleModule'
import {SingleController} from '../singles/types/SingleController'
import {EntryRemover} from '../registry/types/EntryRemover'
import {fetchableProperties} from '../lib/fragments'
import {FetchableControllerProperties} from '../types/FetchableControllerProperties'
import {AxiosResponse} from 'axios'
import {PageInfo} from './types/PageInfo'

export type ListFactoryArgs<T> = {
  store: BaseProxyStore<BaseListModule<T>>,
  globalOptions: GlobalOptions,
}

export function listControllerFactory<T>({store, globalOptions}: ListFactoryArgs<T>) {
  const {commit, dispatch, attr, makeModule, makeProxy, moduleState} = store
  const tracker: {[key: string]: EntryRemover} = {}
  const controller: Omit<ListController<T>, keyof FetchableControllerProperties> = {
    get moduleType (): 'list' {
      return 'list'
    },
    uid: randomUUID(),
    // Direct access if needed.
    attr,
    commit,
    dispatch,
    get name () {
      return controller.attr('name')
    },
    get namespace() {
      return explodeName(controller.name)
    },
    // There is no setter equivalent because setting requires async functions, which would need to be awaited
    // for this to be useful. If you need to set the list, use the setList() function instead.
    get rawList() {
      return controller.list.map((controller) => controller.x as T)
    },
    set rawList(val: T[]) {
      controller.dispatch('setList', val)
    },
    get managedNames() {
      return [...controller.attr('refs'), controller.name]
    },
    get rawState() {
      return moduleState()
    },
    get pageInfo() {
      return this.attr('pageInfo')
    },
    set pageInfo(val: PageInfo | null) {
      this.commit('setPageInfo', val)
    },
    get grow() {
      return this.attr('grow')
    },
    set grow(val: boolean) {
      // Should only be used during testing, since state can't be guaranteed sane if set at runtime.
      this.commit('setGrow', val)
    },
    get count() {
      return (controller.pageInfo && controller.pageInfo.count) || null
    },
    get paginated() {
      return this.attr('paginated')
    },
    get empty() {
      return (
        (!controller.paginated || (controller.currentPage === 1)) &&
        (controller as ListController<T>).ready &&
        controller.list.length === 0
      )
    },
    get currentPage() {
      return globalOptions.client.paginator.getCurrentPage(controller.rawState)
    },
    set currentPage(val: number) {
      controller.setPage(val)
      controller.get().catch(() => undefined)
    },
    get list() {
      const controllers: SingleController<T>[] = []
      const names = new Set(controller.attr('refs'))
      names.forEach((name) => {
        const result = getController<typeof SingleModule, BaseSingleModule<T>, SingleController<T>>({
          module: SingleModule,
          uid: controller.uid,
          namespace: explodeName(name),
          globalOptions,
          makeModule,
          makeProxy,
        })
        tracker[name] = result.remover
        controllers.push(result.controller)
      })
      for (const name of Object.keys(tracker)) {
        if (names.has(name)) {
          continue
        }
        tracker[name](controller.uid)
        delete tracker[name]
      }
      return controllers.filter((controller) => controller.x && !controller.deleted)
    },
    get totalPages() {
      return globalOptions.client.paginator.getTotalPages(controller.rawState)
    },
    preDestroy() {
      controller.commit('kill')
      controller.rawList = []
      for (const name of Object.keys(tracker)) {
        tracker[name](controller.uid)
        delete tracker[name]
      }
    },
    async get() {
      return controller.dispatch('get')
    },
    async post<I, O>(val: I) {
      return await controller.dispatch<'post'>('post', val) as AxiosResponse<O>
    },
    makeReady(val: T[]) {
      // Mostly used for testing, can be used to set the value of X in a component that would otherwise be waiting
      // on a network call to complete.
      return controller.dispatch('makeReady', val)
    },
    prefix(val: T[]) {
      controller.dispatch('prefix', val)
    },
    extend(val: T[]) {
      controller.dispatch('extend', val)
    },
    toJSON: () => {
      return {controller: controller.name, moduleType: controller.moduleType, list: controller.rawList}
    },
    setPage: (val: number) => {
      globalOptions.client.paginator.setPage(controller as ListController<T>, val)
    },
  }
  completeAssign<ListController<T>>(controller, fetchableProperties(controller))
  return globalOptions.transformers.controller(controller as ListController<T>)
}