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
import {FormError} from '../forms/types/FormError'
import {FormErrorSet} from '../forms/types/FormErrorSet'
import {NetCallOptions} from '../types/NetCallOptions'

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
export function missingFieldError<T>(errors: FormError<T>): string[] {
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

export function deriveErrors<T>(error: AxiosError, knownFields: Array<keyof T>): FormErrorSet {
  const errorSet: FormErrorSet<T> = {
    fields: {},
    errors: [],
  }
  if (!error.response || !error.response.data || !(isObject(error.response.data))) {
    if (error.code && ERROR_TRANSLATION_MAP[error.code]) {
      errorSet.errors.push(ERROR_TRANSLATION_MAP[error.code])
      return errorSet
    }
    errorSet.errors = [ERROR_TRANSLATION_MAP.UNKNOWN]
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
    errorSet.errors.push(error.response.data.detail)
  }
  if (Object.keys(unresolved).length) {
    errorSet.errors.push(...missingFieldError(unresolved))
  }
  return errorSet
}

/**
 * Example wrapper function around Axios. This is provided as the default example function for
 * :js:attr:`GlobalOptions.netCall`. Defined in :browse:`this file <src/base/lib/index.ts>`.
 *
 * @typeParam T The type of the data sent in the request. This might be undefined for get.
 * @typeParam K The type of the data expected to return from the server. Defaults to `T`.
 */
export function baseCall<T, K = T>(options: NetCallOptions<T>): Promise<K> {
  const preSuccess = (response: AxiosResponse) => {
    return response.data
  }
  const config = {...options, preSuccess}
  return axios.request(config).then(preSuccess)
}