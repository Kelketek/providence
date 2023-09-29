import {PageInfo} from '../lists/types/PageInfo'

/**
 * Structure returned by a [deriveList function](../interfaces/types_ProvidenceClient.ProvidenceClient.md#deriveList)`.
 */
export interface PaginationResult<T> {
  /**
   * An array of objects of type `T`.
   */
  list: T[],
  /**
   * Meta information about pagination derived from the server response.
   */
  pageInfo: PageInfo | null,
}
