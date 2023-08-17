// Used for some tests to force mocked promises forward.
import {AxiosResponse, Method} from "axios/index";

export const flushPromises = () => {
  return new Promise(function (resolve) {
    setTimeout(resolve);
  });
}
const AxiosHeaders = jest.requireActual('axios').AxiosHeaders
// Awaits until a function doesn't return false and doesn't throw an exception.
export const waitFor = async (test: () => any | void, description?: string, timeout?: number) => {
  const message = description || 'A check to pass.'
  const timedelta = timeout || 10000
  const startTime = new Date()
  let error: Error | undefined
  while ((new Date().getTime() - startTime.getTime() < timedelta)) {
    try {
      const result = test()
      if (!!result || result === undefined) {
        return
      }
      error = undefined
    } catch (err: any) {
      error = err
    }
  }
  if (error) {
    console.error(`Failed waiting for: ${message}`)
    throw error
  }
  throw Error(`Failed waiting for: ${message}`)
}
// Mock request builder for axios.
export const rq = (url: string, method: Method, data?: any, config?: { [key: string]: any }) => {
  config = config || {signal: expect.any(AbortSignal)}
  if (!config.params && method === 'get') {
    config.params = {}
  }
  if (data) {
    config.data = data
  }
  return {url, method, ...config}
}

// Mock response builder for axios.
export function rs(data: any, extra?: Partial<AxiosResponse>): AxiosResponse {
  const extraData = extra || {}
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {'Content-Type': 'application/json; charset=utf-8'},
    config: {
      headers: new AxiosHeaders(),
    },
    ...extraData,
  }
}
