import {QueryParams} from './QueryParams'
import {Method} from 'axios'

/**
 * NetCallOptions are the arguments for the [netCall](../interfaces/types_GlobalOptions.GlobalOptions.md#netcall) function.
 *
 * @typeParam T The type of the data being sent as JSON (or otherwise structured) data.
 */
export interface NetCallOptions<T> {
  url: string,
  /** HTTP Verb, like `get`, `post`, `patch`, `put`, or `delete`. */
  method?: Method,
  /** JSON/structured data to send to the endpoint. May be undefined if this is a `get` request.  */
  data?: T,
  /** Query parameters. Will construct a query string based on stringifying the contents of this object. */
  params?: QueryParams,
  /** AbortSignal, now standard in all browsers that matter. Used to abort a call from outside. */
  signal: AbortSignal,
}
