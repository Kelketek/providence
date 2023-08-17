/**
 * PageInfo contains meta information on pagination returned by the server. It is mostly used by the
 * :js:class:`Pagination` part of the :js:class:`Client`.
 */
export interface PageInfo {
  /**
   * The total number of items in the remote array-- that is, over every page the server can return, what is the total
   * number of items that will be returned? Not every API supports returning this, so its use is minimized in
   * providence.
   */
  count: number
  /**
   * The size of the page that the server is returning-- not how many items are in it, but how many it would return if
   * returning a full page. Like count, not available for every API, and so not heavily relied on in Providence.
   */
  size: number
}