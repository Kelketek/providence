import {BaseController} from '../../types/BaseController'
import {QueryParams} from '../../types/QueryParams'
import ErrorTracking from '../../types/ErrorTracking'
import {BaseListModule} from './BaseListModule'
import {SingleController} from '../../singles/types/SingleController'
import {AxiosResponse} from 'axios'
import {PageInfo} from './PageInfo'

export interface ListController<T> extends BaseController<BaseListModule<T>> {
  /**
   * Returns `'list`', the type of module this controller handles.
   */
  moduleType: 'list',
  /**
   * An array of [SingleControllers](../../../module_types/singles.md#single-controllers) based on the contents of
   * the list.
   */
  list: SingleController<T>[],
  /**
   * Property which returns all the x values of all SingleControllers as a single array.
   * Setting this value to a new array replaces all the SingleModules within it.
   */
  rawList: T[],
  /**
   * The endpoint property on the list module. This is a getter/setter, so you can update the endpoint.
   */
  endpoint: string,
  /**
   * Fetch the list from its endpoint. No matter how many times this function is called, it only runs once, allowing
   * you to call it in any component that may need the function and not worry about several requests being sent.
   */
  getOnce: () => void,
  /**
   * A list of SingleControllers
   */
  /**
   * Performs a get request. Will create/replace the tracked [Single](../../../module_types/singles.md) modules based
   * on what it retrieves, and return a promise containing the raw values.
   */
  get: () => Promise<T[]>,
  /**
   * Sends a post request. DOES NOT update the single modules with the value returned from the server. Returns a promise
   * containing the value the server sent back.
   */
  post: <I, O = I>(val: I) => Promise<AxiosResponse<O>>,
  /**
   * Sets the page number. Does not perform a fetch request. Use .get() after setting this value to get the new
   * page.
   */
  setPage: (val: number) => void,
  /**
   * Retrieves the stored error information from our last attempt at [getting](#get) the
   * remote list.
   */
  errors: ErrorTracking,
  /**
   * Empties out the values in [errors](#errors).
   */
  resetErrors: () => void,
  /**
   * Set up the single modules and mark [ready](#ready) as `true`. Mostly useful for testing.
   *
   * Unlike with
   * [the single controller version of this function](../interfaces/singles_types_SingleController.SingleController.md#makeready),
   * this version returns a promise, since it has to create new modules separate from the list's own internal state
   * and so must create several internal transactions rather than a single commit.
   */
  makeReady: (val: T[]) => T[],
  /**
   * Prefix the list with more single modules, keeping the existing ones in place.
   */
  prefix: (val: T[]) => void,
  /**
   * Extend the list with more single modules, keeping the existing ones in place.
   */
  extend: (val: T[]) => void,
  /**
   * Getter/setter to indicate that the list is initialized and ready to be interacted with.
   * Mostly set internally, but can be explicitly set during testing.
   */
  ready: boolean,
  /**
   * Getter/setter to indicate that the list is being fetched via `get` request. Can be set
   * manually if needed for testing.
   */
  fetching: boolean,
  /**
   * Getter/setter to indicate that the attempt to fetch the list failed. Can be set
   * manually if needed for testing.
   */
  failed: boolean,
  /**
   * Returns the total number of pages at the endpoint, or null if this is not known/applicable.
   */
  totalPages: number | null,
  /**
   * Getter/setter for query parameters used when interacting with the endpoint.
   */
  params: QueryParams|null,
  /**
   * Returns the keyProp of the list-- that is, the unique ID property on each single used to tell them apart. This
   * is usually something like 'id', which is the default.
   */
  keyProp: keyof T,
  /**
   * An object that contains some mate information about pagination, such as the total count of items the endpoint
   * tracks, and the size of the most recently returned array from the server.
   */
  pageInfo: PageInfo | null,
  /**
   * Getter/setter to indicate whether the list is in 'grow' mode, whereas the pages are fetched, the contents
   * are added to the list rather than replacing it.
   */
  grow: boolean,
  /**
   * Getter that tells you how many total items are in the list at the endpoint. This may not be something every API
   * supports. It will be null if the information is unknown, such as before the list is fetched or if the client
   * function for list handling doesn't include this information.
   */
  count: number | null,
  /**
   * Getter that tells you if this is marked as a paginated list.
   */
  paginated: boolean,
  /**
   * The current page number. Stays at 1 if the list is unpaginated. If set, the state will be updated to the target
   * page number, and a fetch will be started for the target page. This is useful for components that increment/set
   * target page values as part of pagination.
   */
  currentPage: number,
  /**
   * Returns true if the page is *definitively* empty. That means the list has been fetched, no items have been
   * returned, and the current page is 1.
   */
  empty: boolean,
  /**
   * Custom JSON serializer to prevent infinite recursion.
   *
   * @private
   */
  toJSON: () => {
    controller: string,
    moduleType: 'list',
    list: T[],
  }
}
