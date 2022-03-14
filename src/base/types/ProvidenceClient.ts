import {NetCallOptions} from './NetCallOptions'
import {PaginationResult} from './PaginationResult'
import {AxiosError, AxiosResponse} from 'axios'
import {DeriveListArgs} from './DeriveListArgs'
import {DeriveSingleArgs} from './DeriveSingleArgs'
import {Paginator} from './Paginator'
import {FormErrorSet} from '../forms/types/FormErrorSet'


export interface ProvidenceClient {
  /**
   * A wrapper around Axios's request function. Define this to include things like Authentication headers
   * in your network requests.
   */
  netCall<T, K = T>(opts: NetCallOptions<T>): Promise<AxiosResponse<K>>,
  /**
   * Given an AxiosResponse and the current state of the single module, derive a single from the response.
   */
  deriveSingle<T>(args: DeriveSingleArgs<T>): T,
  /**
   * Takes an AxiosResponse from the server and returns a list with pagination info.
   */
  deriveList<T>(args: DeriveListArgs<T>): PaginationResult<T>,
  /**
   * A function that takes an error raised by netCall and returns a FormErrorSet.
   *
   * @param val An error raised by netCall when making a network request.
   * @param knownFields The fields the current interface is aware of. This makes it easy to notice missing fields
   *   your frontend doesn't know about but you received an error for-- the ones you don't provide are put into a global
   *   error section instead so your users can report them to you.
   */
  deriveErrors<T>(val: AxiosError, knownFields: Array<keyof T>): FormErrorSet,
  /**
   * The paginator is an object full of functions that instruct Providence in how to handle pagination for your API.
   */
  paginator: Paginator,
}