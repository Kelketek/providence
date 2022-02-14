import {createStore, IModuleStore} from 'redux-dynamic-modules'
import {defaultContextValues, ProvidenceContext} from '../context'
import {ReactComponentElement, ReactNode} from 'react'
import {Provider} from 'react-redux'
import {GlobalOptions} from '../../base/types/GlobalOptions'
import {render} from '@testing-library/react'
import {AxiosResponse, Method} from 'axios'

export type ContextRenderOptions = {root?: HTMLElement, context?: GlobalOptions, store?: IModuleStore<any>}

export const ctxRender = (ui: ReactComponentElement<any>, {context, store}: ContextRenderOptions) => {
  const builtContext = {...defaultContextValues(), ...context}
  const targetStore = store || createStore({})
  const wrapper = ({children}: {children: ReactNode}) => (
    <Provider store={targetStore}>
      <ProvidenceContext.Provider value={builtContext}>
        {children}
      </ProvidenceContext.Provider>
    </Provider>
  );
  return render(ui, {wrapper})
}

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
  config = config || {signal: expect.any(Object)}
  if (!config.params && method === 'get') {
    config.params = {}
  }
  if (data) {
    config.data = data
  }
  if (!config.preSuccess) {
    config.preSuccess = expect.any(Function)
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
    config: {},
    ...extraData,
  }
}

// Used for some tests to force mocked promises forward.
export const flushPromises = () => {
  return new Promise(function(resolve) {
    setTimeout(resolve);
  });
}
