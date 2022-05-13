import {QueryParams} from '../../types/QueryParams'

/**
* The construction parameters are mostly state that the SingleModule will be initialized with. This contains both the
* data of both the singleton itself and meta information about its status and how it is to be managed.
*/
export interface SingleModuleOptions<T> {
  /**
   * The name of the module. Don't specify this-- it will be automatically supplied internally elsewhere.
   *
   * @private
   */
  name: string,
  /**
   * Initial value for x, which is the data structure the module is tracking.
   *
   * Default: null
   *
   * @type T | null
   */
  x?: T | null,
  /**
   * The URL for the endpoint this single tracks. You can set this to # if you're only using this single for local
   * state management. This will prevent the patchers from making bogus network requests.
   */
  endpoint?: string,
  /**
   * If set to true, the registry will not remove this module even if all listening components are removed.
   */
  persistent?: boolean,
  /** Indicates whether we have attempted to fetch the data from its endpoint before. **/
  attempted?: boolean,
  /** Indicates whether we are currently waiting on the data to load from its endpoint. **/
  fetching?: boolean,
  /** Indicates that we have fetched the component and x is now ready. **/
  ready?: boolean,
  /** Indicates that our attempt to fetch the data has failed. **/
  failed?: boolean,
  /** Indicates that the resource this single is tracking has been deleted. **/
  deleted?: boolean,
  /** The query string parameters used when performing network operations on the endpoint. **/
  params?: QueryParams | null,
}