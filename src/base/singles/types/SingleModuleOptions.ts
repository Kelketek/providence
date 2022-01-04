/*
The construction parameters are mostly state that the SingleModule will be initialized with. This contains both the
data of both the singleton itself and meta information about its status and how it is to be managed.
*/
import {QueryParams} from '../../types/QueryParams'

export interface SingleModuleOptions<T> {
  name: string,
  x?: T | null,
  endpoint?: string,
  persistent?: boolean,
  attempted?: boolean,
  fetching?: boolean,
  ready?: boolean,
  failed?: boolean,
  deleted?: boolean,
  params?: QueryParams | null,
}