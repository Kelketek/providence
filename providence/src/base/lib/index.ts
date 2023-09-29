/**
 * This is the doc comment for base/lib/index.ts
 *
 * Specify this is a module comment without renaming it:
 * @module
 */
/*
This function is used to provide a promise for something which is already known. For instance, there is no reason
to refetch a resource if we already have it, but the client code may expect a promise rather than a return value.
 */
import axios, {AxiosError, AxiosResponse} from 'axios'
import {FieldErrors} from '../forms/types/FieldErrors'
import {FormErrorSet} from '../forms/types/FormErrorSet'
import {NetCallOptions} from '../types/NetCallOptions'
import {PaginationResult} from '../types/PaginationResult'
import {DeriveListArgs} from '../types/DeriveListArgs'
import {DeriveSingleArgs} from '../types/DeriveSingleArgs'
import {ListState} from '../lists/types/ListState'
import {ListController} from '../lists/types/ListController'
import {DeriveFormArgs} from '../types/DeriveFormArgs'
import isEqual from 'lodash/isEqual'

export function immediate<T>(val: T): Promise<T> {
  return new Promise<T>((resolve) => {
    resolve(val)
  })
}

/*
Given an array of strings, to be interpreted as a 'path' to nest our way down into the state, flatten the
array down into a dotted string path that can be traversed to get to the target state object.
 */
export function flattenNamespace(namespace: string[]): string {
  // encodeURIComponent will not encode dots
  return namespace.map((val) => encodeURIComponent(val).replace(/\./g, '%2E')).join('.')
}

/*
Given a dotted path to a selection within the state, turn this dotted path into an array of strings to iterate over
and navigate down the state object to them.
 */
export function explodeName(name: string): string[] {
  return name.split('.').map(
    (val) => decodeURIComponent(val))
}

/*
Build a 'nested path.' This is used primarily by the registries to find registered children,
since any string could be the name of a child entry, we have to have an explicit 'children' key
in the entry containing all children. So, this allows us to take a path like:

    ['user', 'checklists', 'tasks']

and turn it into:

    ['user', 'children', 'checklists', 'children', 'tasks']

Note that the last entry doesn't have 'children' after it. That is because it is the target
entry we're trying to select.
 */
export function buildNestedPath(namespace: string[], nestString: string): string[] {
  const result: string[] = []
  namespace.map((val, index) => {
    if (index !== namespace.length - 1) {
      result.push(val, nestString)
    } else {
      result.push(val)
    }
  })
  return result
}

/*
Follow the path of properties down an object, retrieve what's there, and return it. If silent
is set, retrieve undefined should the property be undefined any step of the way. Otherwise,
the function will throw if any intermediate step returns undefined.

This function can still return undefined if the target is undefined only at the last location,
even if silent is not set.
*/
export function retrieveName<T>(start: any, path: string[], silent?: boolean): T | undefined {
  let value: any = start
  const currentRoute: string[] = []
  for (const namespace of path) {
    if (value === undefined) {
      if (silent) {
        return undefined
      }
      throw Error(`Property ${currentRoute.join('.')} is not defined.`)
    }
    currentRoute.push(namespace)
    value = value[namespace]
  }
  return value
}

/*
Determines if a value is an object, side-stepping the pitfalls of 'typeof' when asking
it that question.
 */
export const isObject = (val: any): boolean => {
  return typeof val === 'object' &&
    !Array.isArray(val) &&
    val !== null
}

/*
Like retrieveName, but creates the path if it doesn't exist, returning the (potentially newly created) entry.
 */
export function createPath<T>(start: any, path: string[], entryFactory: () => T): T {
  let value: any = start
  if (!isObject(value)) {
    throw Error(`Starting object is not an object. Cannot define new entries. Was: ${value}`)
  }
  for (const namespace of path) {
    if (value[namespace] === undefined) {
      value[namespace] = entryFactory()
    }
    value = value[namespace]
  }
  return value
}

// If you've made some post request that fails because of a missing field,
// there's a coding error that's gone undetected. (Hopefully) the user will nag us about it
// with this message.
export function missingFieldError<T>(errors: FieldErrors<T>): string[] {
  const result: string[] = []
  for (const key of Object.keys(errors)) {
    result.push(
      'Whoops! We had a coding error. Please contact support and tell them the following: ' +
      key + ': ' + errors[key as keyof T].join(' '))
  }
  return result
}

// Common network error codes and a user-friendly string to translate them to.
const ERROR_TRANSLATION_MAP: {[key: string]: string} = {
  ECONNABORTED: 'Timed out or aborted. Please try again or contact support.',
  UNKNOWN: 'We had an issue contacting the server. Please try again later.',
}

export function baseDeriveErrors<T>(error: AxiosError<any, any>, knownFields: Array<keyof T>): FormErrorSet {
  const errorSet: FormErrorSet<T> = {
    status: `${error.code || ''}`,
    messages: [],
    fields: {},
  }
  if (!error.response || !error.response.data || !(isObject(error.response.data))) {
    if (error.code && ERROR_TRANSLATION_MAP[error.code]) {
      errorSet.messages.push(ERROR_TRANSLATION_MAP[error.code])
      return errorSet
    }
    errorSet.messages = [ERROR_TRANSLATION_MAP.UNKNOWN]
    return errorSet
  }
  const unresolved: {[key: string]: string[]} = {}
  for (const key of Object.keys(error.response.data)) {
    if (knownFields.indexOf(key as keyof T) !== -1) {
      errorSet.fields[key as keyof T] = error.response.data[key]
    } else if (key !== 'detail') {
      unresolved[key] = error.response.data[key]
    }
  }
  if (error.response.data.detail) {
    errorSet.messages.push(error.response.data.detail)
  }
  if (Object.keys(unresolved).length) {
    errorSet.messages.push(...missingFieldError(unresolved))
  }
  return errorSet
}

/**
 * Example wrapper function around Axios. This is provided as the default example function for
 * [GlobalOptions.netCall](../interfaces/types_GlobalOptions.GlobalOptions.md#netcall).
 *
 * @typeParam T The type of the data sent in the request. This might be undefined for get.
 * @typeParam K The type of the data expected to return from the server. Defaults to `T`.
 */
export function baseCall<T, K = T>(options: NetCallOptions<T>): Promise<AxiosResponse<K>> {
  return axios.request(options)
}

/**
 * Example function for deriving lists from an Axios response. This is based on the output from the
 * Django REST framework's paginator. You may want to replace the function with your own.
 */
export function baseDeriveList<T>({response, state}: DeriveListArgs<T>): PaginationResult<T> {
  if (state.paginated) {
    return {
      list: response.data.results,
      pageInfo: {size: response.data.size, count: response.data.count},
    }
  } else {
    return {
      list: response.data,
      pageInfo: null,
    }
  }
}

/**
 * Example function for deriving singles from an Axios response. This is based on the output from the Django REST
 * framework, which places the object right at the root of the data response by default.
 */
export function baseDeriveSingle<T>({response}: DeriveSingleArgs<T>): T {
  return response.data
}

/**
 * Example function for deriving data from the Axios response after submitting a form. We'll assume for this example
 * that its structure will be the same as for deriving single data.
 */
export function baseDeriveForm<T, K = T>({response}: DeriveFormArgs<T>): K {
  return response.data
}

/**
 * Like `Object.assign`, but also copies full descriptors, such as setters/getters.
  */
export const completeAssign = <T>(target: Partial<T>, ...sources: Partial<T>[]) => {
  // Modified from https://stackoverflow.com/a/60114832/927224
  sources.forEach(source => {
    const descriptors = Object.keys(source).reduce((descriptors: PropertyDescriptorMap, key) => {
      descriptors[key] = Object.getOwnPropertyDescriptor(source, key) as PropertyDescriptor;
      return descriptors
    }, {})

    // By default, Object.assign copies enumerable Symbols, too
    Object.getOwnPropertySymbols(source).forEach(sym => {
      const descriptor = Object.getOwnPropertyDescriptor(source, sym) as PropertyDescriptor;
      if (descriptor.enumerable) {
        descriptors[sym as unknown as string] = descriptor
      }
    });
    Object.defineProperties(target, descriptors)
  });
  return target
}

/**
 * Example pagination initialization plugin. It is run upon a module's initial state before it's first committed. Return
 * the revised state.
 */
export const baseInitializePagination = <T>(state: ListState<T>) => {
  if (!state.params) {
    state.params = {}
  }
  state.params.page = state.params.page || '1'
  state.params.size = state.params.size || '24'
  return state
}

/**
 * Example 'get current page' function. Gets the current page from the list state.
 */
export const baseGetCurrentPage = <T>(state: ListState<T>) => {
  return parseInt(`${(state.params && state.params.page) || 1}`, 10)
}

/**
 * Example 'set current page' function. Works upon the controller. This should not call the actual fetch request.
 */
export const baseSetCurrentPage = <T>(controller: ListController<T>, page: number) => {
  const params = {...controller.params}
  params.page = `${page}`
  controller.params = params
}

/**
 * Example 'get total pages' function. Works upon the list state. Client APIs aren't guaranteed to support this,
 * so we try to avoid use of this value in Providence itself. Null is a possible return here.
 */
export const baseGetTotalPages = <T>(state: ListState<T>) => {
  if (state.paginated && state.pageInfo) {
    return (state.pageInfo.count / state.pageInfo.size) || 1
  }
  return null
}


/**
 * Wraps a function for memoization. The resulting function will return the same result
 * if given the same arguments.
 */
export const memoizer = <Func extends (...args: any[]) => any>(sourceFunc: Func) => {
  let cached: ReturnType<Func>
  let lastArgs: any[]
  return (...args: any[]) => {
    if (lastArgs !== undefined && isEqual(args, lastArgs)) {
      return cached
    }
    lastArgs = args
    cached = sourceFunc(...args)
    return cached
  }
}

/**
 * No-op passthrough function which returns what is handed to it. Useful to explicitly silence promise chains.
 * @param input Whatever the promise resolves to. This is also returned by the function.
 */
export const nop = (input: unknown) => input
