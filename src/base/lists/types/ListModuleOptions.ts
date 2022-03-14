import {QueryParams} from '../../types/QueryParams'

/**
 * The construction parameters for lists dictate the behavior around handling its
 * :ref:`Singles <module_types/singles:Singles>` and the network requests used to manage them.
 */
export interface ListModuleOptions<T> {
  /** The name of the module. Don't specify this-- it will be automatically supplied internally elsewhere.
   *
   * @private
   */
  name: string,
  /**
   * Whether the list should be an 'infinite scrolling' list where the more the user scrolls the more items are added,
   * rather than replacing the entire page with a new page.
   */
  grow?: boolean,
  /**
   * The current page of the request. This is always 1 in cases where the list endpoint isn't paginated.
   *
   * Note that this value is fed to a transformation function and may change the value of params when set.
   *
   * TODO: Implement and document the transformation functionality.
   */
  currentPage?: number,
  /**
   * The URL for the endpoint this list tracks. `#` by default, which will make sure all the singles use
   * `#` as well. See the Single module documentation for more details.
   */
  endpoint?: string,
  /**
   * The page size to request from the server. The default for this is in the global settings.
   *
   * Note that this value is fed to a transformation function and may change the value of params when set.
   *
   * TODO: Implement and document the transformation functionality.
   */
  pageSize?: number,
  /**
   * Flag that indicates if the contents of the list should be considered in inverted order. This is most useful
   * when dealing with an endpoint that provides 'most recent' value as the last item. Most commonly used with 'growth',
   * it can be used for situations like 'loading more comment history' and scrolling up to see the result.
   */
  reverse?: boolean,
  /**
   * If set to True, the registry will not remove this module even if all listening components are removed.
   */
  persistent?: boolean,
  /**
   * The unique identifier key prop on the singles pulled from this endpoint. This will depend on your API but most of
   * the time it will be 'id', which is the default value.
   */
  keyProp?: keyof T,
  /**
   * Whether or not this endpoint is paginated. Defaults to true. Paginated endpoints are put through
   * transformation functions to handle the pagination.
   *
   * TODO: Implement and document the transformation functionality.
   */
  paginated?: boolean,
  /** The query string parameters used when performing network operations on the endpoint. **/
  params?: QueryParams | null,
}
