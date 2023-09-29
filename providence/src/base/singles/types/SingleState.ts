/*
The single is the fundamental state component. It is used to build other components, like lists, or custom controllers
made of multiple singles. Singles usually have an endpoint where changes can be sent to a REST backend. However
they may just be created to conveniently declare shared state, since Providence can scaffold up all required
mutations and actions needed to create a new singleton on the fly.
 */
import {QueryParams} from '../../types/QueryParams'
import {BaseState} from '../../types/BaseState'
import {PatchersRoot} from './PatchersRoot'
import ErrorTracking from '../../types/ErrorTracking'

export interface SingleState<T> extends BaseState {
  x: T | null,
  endpoint: string,
  fetching: boolean,
  ready: boolean,
  failed: boolean,
  deleted: boolean,
  params: QueryParams | null,
  patchers: Partial<PatchersRoot<T>>,
  errors: ErrorTracking,
}