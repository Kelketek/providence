import {createStore, IModuleStore} from 'redux-dynamic-modules'
import {ctxRender, getSingle} from './helpers'
import {CodeRunner} from './CodeRunner'
import {SingleState} from '@opencraft/providence/singles/types/SingleState'
import {useSingle} from '../index'
import {useLayoutEffect} from 'react'
import mockAxios from 'jest-mock-axios'
import {PatchersRoot} from '@opencraft/providence/singles/types/PatchersRoot'
import {initialPatcherState} from '@opencraft/providence/singles/patcher'
import {flushPromises, rq, rs, waitFor} from '@opencraft/providence/specs/helpers'
import {GlobalOptions} from '@opencraft/providence/types/GlobalOptions'
import {defaultContextValues} from '../context'
import {act} from '@testing-library/react'

let store: IModuleStore<any>
let context: GlobalOptions

// Adds initial patcher settings to state from runtime data if they don't already exist.
export const patchersFromObject = <T,>(x: Partial<T>) => {
  const result: Partial<PatchersRoot<T>> = {}
  for (const key of Object.keys(x)) {
    const item = key as string & keyof typeof x
    result[item] = initialPatcherState()
  }
  return result as PatchersRoot<T>
}

export function singleState(name = 'single.test', overrides?: Partial<SingleState<any>>) {
  let patchers: PatchersRoot<any>
  if (overrides && overrides.x) {
    patchers = patchersFromObject(overrides.x)
  } else {
    patchers = {}
  }
  return {
    [name]: {
      name,
      deleted: false,
      endpoint: '#',
      failed: false,
      fetching: false,
      params: null,
      persistent: false,
      ready: false,
      x: null,
      patchers,
      errors: {status: '', messages: []},
      ...overrides,
    },
  }
}

declare interface TestType {
  a: string,
}

const makeSingle = () => {
  useSingle('test', {})
}

describe('Single module handling', () => {
  const mockWarn = jest.spyOn(console, 'warn')
  beforeEach(() => {
    mockAxios.reset()
    store = createStore({})
    context = defaultContextValues()
  })
  afterEach(() => {
    mockWarn.mockReset()
  })
  it('Creates a single module', async () => {
    await ctxRender(<CodeRunner code={makeSingle}/>, {store})
    expect(store.getState()).toEqual(singleState())
  })
  it('Removes the single module when unmounted', async () => {
    const result = ctxRender(<CodeRunner code={makeSingle}/>, {store})
    result.unmount()
    expect(store.getState()).toEqual({})
  })
  it('Does not break if a module is invoked multiple times', async () => {
    await ctxRender((
      <div>
        <CodeRunner code={makeSingle} />
        <CodeRunner code={makeSingle} />
      </div>
    ), {store})
    expect(store.getState()).toEqual(singleState())
  })
  it('Does not destroy the state if only one of the components is removed', async () => {
    const result = ctxRender((
      <div>
        <CodeRunner code={makeSingle} />
        <CodeRunner code={makeSingle} />
      </div>
    ), {store})
    result.rerender((
      <div>
        <CodeRunner code={makeSingle} />
      </div>
    ))
    expect(store.getState()).toEqual(singleState())
    // Now the state should be properly gone, and no warnings should have been triggered.
    result.rerender(<div />)
    expect(mockWarn).not.toHaveBeenCalled()
  })
  it('Fetches a controller on mount, and reacts to the result.', async () => {
    const fetchAndReact = () => {
      const controller = useSingle<TestType>('test', {endpoint: '/test/'})
      useLayoutEffect(() => {
        controller.get()
      }, [])
      return {...controller.x}
    }
    const result = ctxRender((
        <CodeRunner code={fetchAndReact} renderResult={true} />
    ), {store})
    expect(store.getState()).toEqual(singleState('single.test', {fetching: true, endpoint: '/test/'}))
    expect(mockAxios.request).toHaveBeenCalledWith(rq('/test/', 'get'))
    act(() => mockAxios.mockResponse(rs({a: 'boop'})))
    await flushPromises()
    await waitFor(() => !!result.getByText(JSON.stringify({a: 'boop'})))
  })
  it('Handles a namespaced controller', () => {
    const namespacedController = () => {
      const controller = useSingle<TestType>(['path', 'to', 'module'], {endpoint: '/place/'})
      expect(controller.name).toBe('path.to.module')
      expect(controller.namespace).toEqual(['path', 'to', 'module'])
      expect(store.getState()['path.to.module']['endpoint']).toBe('/place/')
    }
    ctxRender(<CodeRunner code={namespacedController} />, {store})
  })
})

declare type MultipleProps = {
  a: string,
  b: number,
}

describe('Single mutation handling', () => {
  beforeEach(() => {
    store = createStore({})
  })
  it('Updates a field', () => {
    const mutator = () => {
      const controller = useSingle<MultipleProps>('test', {x: {a: 'stuff', b: 2}})
      useLayoutEffect(() => {
        controller.updateX({b: 3})
        expect(controller.x).toEqual({a: 'stuff', b: 3})
      }, [])
    }
    ctxRender(<CodeRunner code={mutator} />, {store})
  })
  it('Updates the endpoint', () => {
    const mutator = () => {
      const controller = useSingle('test', {})
      useLayoutEffect(() => {
        expect(controller.endpoint).toBe('#')
        expect(store.getState()[controller.name].endpoint).toBe('#')
        controller.endpoint = '/test/'
        expect(store.getState()[controller.name].endpoint).toBe('/test/')
      }, [])
    }
    ctxRender(<CodeRunner code={mutator} />, {store})
  })
  it.each`
    prop
    ${'ready'}
    ${'fetching'}
    ${'failed'}
    ${'deleted'}
  `('Updates the $prop status flag', ({prop}: {prop: 'ready' | 'fetching' | 'failed' | 'deleted'}) => {
    const mutator = () => {
      const controller = useSingle<MultipleProps>('test', {x: null, [prop]: false})
      useLayoutEffect(() => {
        expect(controller[prop]).toBe(false)
        expect(store.getState()[controller.name][prop]).toBe(false)
        controller[prop] = true
        expect(controller[prop]).toBe(true)
        expect(store.getState()[controller.name][prop]).toBe(true)
      }, [])
    }
    ctxRender(<CodeRunner code={mutator} />, {store})
  })
  it('Performs a round-trip reading and setting of the value of X via controller', async () => {
    const xRoundTrip = () => {
      const controller = useSingle<TestType>('test', {})
      useLayoutEffect(() => {
        expect(controller.x).toBeNull()
        controller.x = {a: 'stuff'}
        expect(controller.x).toEqual({a: 'stuff'})
        expect(store.getState()).toEqual(singleState('single.test', {x: {a: 'stuff'}}))
      }, [])
    }
    ctxRender(<CodeRunner code={xRoundTrip} />, {store})
  })
  it('Performs a round-trip reading and setting of params', async () => {
    const paramsRoundTrip = () => {
      const controller = useSingle<TestType>('test', {})
      useLayoutEffect(() => {
        expect(controller.params).toBeNull()
        controller.params = {a: 'stuff'}
        expect(controller.params).toEqual({a: 'stuff'})
        expect(store.getState()).toEqual(singleState('single.test', {params: {a: 'stuff'}}))
        controller.params = null
        expect(controller.params).toBe(null)
        expect(store.getState()).toEqual(singleState('single.test'))
      }, [])
    }
    ctxRender(<CodeRunner code={paramsRoundTrip} />, {store})
    await flushPromises()
  })
  it('Sets X function style', async () => {
    const xFunctionSet = () => {
      const controller = useSingle<TestType>('test', {})
      useLayoutEffect(() => {
        expect(controller.x).toBeNull()
        controller.setX({a: 'stuff'})
        expect(controller.x).toEqual({a: 'stuff'})
        expect(store.getState()).toEqual(singleState('single.test', {x: {a: 'stuff'}}))
      }, [])
    }
    ctxRender(<CodeRunner code={xFunctionSet} />, {store})
  })
  it('Updates X function style', async () => {
    const xFunctionUpdate = () => {
      const controller = useSingle<MultipleProps>('test', {x: {a: 'stuff', b: 1}})
      useLayoutEffect(() => {
        expect(controller.x).toEqual({a: 'stuff', b: 1})
        controller.updateX({a: 'things'})
        expect(controller.x).toEqual({a: 'things', b: 1})
        expect(store.getState()).toEqual(singleState('single.test', {x: {a: 'things', b: 1}}))
      }, [])
    }
    ctxRender(<CodeRunner code={xFunctionUpdate} />, {store})
  })
  it('Throws when updating a null X', async () => {
    const xFunctionUpdate = () => {
      const controller = useSingle<MultipleProps>('test', {x: null})
      useLayoutEffect(() => {
        expect(controller.x).toEqual(null)
        expect(() => controller.updateX({a: 'things'})).toThrow('Cannot update a null singleton.')
      }, [])
    }
    ctxRender(<CodeRunner code={xFunctionUpdate} />, {store})
  })
  it('Forcibly makes the controller ready', async () => {
    const makeXReady = () => {
      const controller = useSingle<MultipleProps>('test', {})
      useLayoutEffect(() => {
        expect(controller.x).toBeNull()
        controller.makeReady({a: 'stuff', b: 3})
        expect(controller.x).toEqual({a: 'stuff', b: 3})
        expect(controller.ready).toBe(true)
        expect(store.getState()).toEqual(singleState('single.test', {x: {a: 'stuff', b: 3}, ready: true}))
      }, [])
    }
    ctxRender(<CodeRunner code={makeXReady} />, {store})
  })
})

describe('Single module tasks', () => {
  beforeEach(() => {
    mockAxios.reset()
    store = createStore({})
    context = defaultContextValues()
  })
  it('Fetches only once', () => {
    const fetchOnce = () => {
      const controller = useSingle<TestType>('test', {endpoint: '/test/'})
      useLayoutEffect(() => {
        controller.getOnce()
        controller.getOnce()
        controller.getOnce()
      })
    }
    ctxRender(<CodeRunner code={fetchOnce} />, {store})
    expect(mockAxios.request).toHaveBeenCalledWith(rq('/test/', 'get'))
    expect(mockAxios.request).toHaveBeenCalledTimes(1)
  })
  it('Fetches with parameters', () => {
    const fetch = () => {
      const controller = useSingle<TestType>('test', {endpoint: '/test/', params: {a: 'test'}})
      useLayoutEffect(() => {
        controller.get()
      }, [])
    }
    ctxRender(<CodeRunner code={fetch} />, {store})
    expect(mockAxios.request).toHaveBeenCalledWith(
      rq('/test/', 'get', undefined, {params: {a: 'test'}, signal: expect.any(Object)}))
    expect(mockAxios.request).toHaveBeenCalledTimes(1)
  })
  it('Handles a fetching failure', async () => {
    const fetchFailure = () => {
      const controller = useSingle<TestType>('test', {endpoint: '/test/'})
      useLayoutEffect(() => {
        controller.get().catch((err) => {
          expect(err + '').toEqual('Error: It broke')
          expect(controller.ready).toBe(false)
          expect(controller.fetching).toBe(false)
          expect(controller.failed).toBe(true)
          expect(controller.errors.status).toEqual('UNKNOWN')
          expect(controller.errors.messages).toEqual(
            ['We had an issue contacting the server. Please try again later.'],
          )
        })
      }, [])
    }
    const result = ctxRender(<CodeRunner code={fetchFailure} />, {store, context})
    expect(mockAxios.request).toHaveBeenCalledWith(
      rq('/test/', 'get', undefined))
    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    act(() => mockAxios.mockError(Error('It broke')))
    result.rerender(<CodeRunner code={fetchFailure} />)
    await flushPromises()
  })
  it('Sets and retrieves errors', async () => {
    const controller = getSingle<TestType>('test', {}, {store, context})
    const errors = {status: 'borked', messages: ['Hello!']}
    controller.errors = {status: 'borked', messages: ['Hello!']}
    expect(controller.errors).toEqual({status: 'borked', messages: ['Hello!']})
    expect(store.getState()).toEqual(singleState('single.test', {errors}))
    controller.resetErrors()
    expect(controller.errors).toEqual({status: '', messages: []})
    expect(store.getState()).toEqual(singleState())
  })
  it('Serializes to JSON', async () => {
    const controller = getSingle<TestType>('test', {x: {a: 'Beep'}}, {store, context})
    expect(JSON.parse(JSON.stringify(controller))).toEqual({
      controller: 'single.test',
      moduleType: 'single',
      x: {a: 'Beep'},
    })
  })
  it('Patches a resource', async () => {
    const controller = getSingle<MultipleProps>('test', {endpoint: '/test/', x: {a: 'stuff', b: 3}}, {store, context})
    controller.patch({b: 4})
    expect(mockAxios.request).toHaveBeenCalledWith(rq('/test/', 'patch', {b: 4}))
    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    mockAxios.mockResponse(rs({a: 'stuff', b: 5}))
    await flushPromises()
    expect(controller.x).toEqual({a: 'stuff', b: 5})
  })
  it('Deletes a resource', async () => {
    const controller = getSingle<TestType>('test', {endpoint: '/test/', x: {a: 'stuff'}}, {store, context})
    controller.delete().then(() => {
      expect(controller.deleted).toBe(true)
    })
    expect(mockAxios.request).toHaveBeenCalledWith(rq('/test/', 'delete'))
    mockAxios.mockResponse(rs(null))
    await flushPromises()
    expect(controller.x).toBe(null)
  })
  it('Puts a resource', async () => {
    const runPut = () => {
      const controller = useSingle<MultipleProps>('test', {endpoint: '/test/', x: {a: 'stuff', b: 3}})
      useLayoutEffect(() => {
        controller.put({b: 4})
      }, [])
      return {...controller.x}
    }
    const result = ctxRender(<CodeRunner code={runPut} renderResult={true} />, {store})
    expect(mockAxios.request).toHaveBeenCalledWith(rq('/test/', 'put', {b: 4}))
    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    act(() => mockAxios.mockResponse(rs({a: 'stuff', b: 5})))
    result.rerender(<CodeRunner code={runPut} renderResult={true} />)
    await flushPromises()
    await waitFor(
      () => !!result.getByText(JSON.stringify({a: 'stuff', b: 5})),
      'The put data to be displayed.',
    )
  })
  it('Posts to the endpoint', async () => {
    let verified = false
    const runPost = () => {
      const controller = useSingle<MultipleProps>('test', {endpoint: '/test/', x: {a: 'stuff', b: 3}})
      useLayoutEffect(() => {
        controller.post<MultipleProps>({a: 'Wat', b: 1}).then((response) => {
          // Post does not automatically update the resource, since its semantics do not necessarily imply changing
          // that particular resource.
          expect(controller.x).toEqual({a: 'stuff', b: 3})
          expect(response.data).toEqual({a: 'Server Response', b: 100})
          verified = true
        })
      }, [])
    }
    ctxRender(<CodeRunner code={runPost} />, {store})
    expect(mockAxios.request).toHaveBeenCalledWith(rq('/test/', 'post', {a: 'Wat', b: 1}))
    mockAxios.mockResponse(rs({a: 'Server Response', b: 100}))
    await flushPromises()
    expect(verified).toBe(true)
  })
})

declare interface NestedValue {
  a: {b: number}
}

describe('Patcher handling', () => {
  const mockError = jest.spyOn(console, 'error')
  beforeEach(() => {
    mockAxios.reset()
    store = createStore({})
    mockError.mockReset()
  })
  it('Ensures patcher identities are consistent', () => {
    const makePatcher = () => {
      const controller = useSingle<MultipleProps>('test', {endpoint: '/test/', x: {a: 'Stuff', b: 4}})
      // Instantiating a second time shouldn't override x.
      const controller2 = useSingle<MultipleProps>('test', {endpoint: '/test/', x: {a: 'Things', b: 5}})
      expect(controller.p.a).toBe(controller2.p.a)
      expect(controller.p.a.model).toEqual(controller2.p.a.model)
      expect(controller.p.a.model).toEqual('Stuff')
      expect(controller.p.b).toBe(controller2.p.b)
      expect(controller.p.b).not.toBe(controller.p.a)
      expect(controller.p.b.model).toEqual(4)
    }
    ctxRender(<CodeRunner code={makePatcher} />, {store})
  })
  it('Patches a value with caching', () => {
    const sendsPatch = () => {
      const controller = useSingle<MultipleProps>('test', {endpoint: '/test/', x: {a: 'Stuff', b: 4}})
      useLayoutEffect(() => {
        expect(controller.p.a.model).toEqual('Stuff')
        expect(controller.p.a.dirty).toBe(false)
        expect(controller.p.a.patching).toBe(false)
        controller.p.a.model = 'Things'
        controller.p.a.debouncedRawSet.flush()
        expect(controller.p.a.model).toEqual('Things')
        expect(controller.p.a.dirty).toBe(true)
        expect(controller.p.a.patching).toBe(true)
        // x should not yet be updated.
        expect(controller.x).toEqual({a: 'Stuff', b: 4})
        const request = mockAxios.lastReqGet()
        expect(request.data).toEqual({a: 'Things'})
        expect(request.url).toBe('/test/')
        expect(request.method).toBe('patch')
        mockAxios.mockResponse(rs({a: 'Things'}))
        expect(controller.p.a.dirty).toBe(false)
        expect(controller.p.a.model).toEqual('Things')
        expect(controller.x).toEqual({a: 'Things', b: 4})
      }, [])
    }
    ctxRender(<CodeRunner code={sendsPatch} />, {store})
  })
  it('Handles a failure', () => {
    const failedPatch = () => {
      const controller = useSingle<MultipleProps>('test', {endpoint: '/test/', x: {a: 'Stuff', b: 4}})
      useLayoutEffect(() => {
        controller.p.a.model = 'Things'
        controller.p.a.debouncedRawSet.flush()
        mockAxios.mockError({response: rs({a: ['Cannot be Things.']}, {status: 400})})
        expect(controller.p.a.errors).toEqual(['Cannot be Things.'])
        expect(controller.p.a.dirty).toBe(true)
        expect(controller.p.a.patching).toBe(false)
      }, [])
    }
    ctxRender(<CodeRunner code={failedPatch} />, {store})
  })
  it('Does not call when the endpoint is #', () => {
    const hashEndpoint = () => {
      const controller = useSingle<MultipleProps>('test', {endpoint: '#', x: {a: 'Stuff', b: 4}})
      useLayoutEffect(() => {
        controller.p.a.model = 'Things'
        controller.p.a.debouncedRawSet.flush()
        expect(mockAxios.request).not.toHaveBeenCalled()
        expect(controller.p.a.dirty).toBe(false)
        expect(controller.p.a.patching).toBe(false)
        expect(controller.p.a.model).toBe('Things')
      }, [])
    }
    ctxRender(<CodeRunner code={hashEndpoint} />, {store})
  })
  it('Returns undefined when the model is not loaded.', () => {
    const undefinedPatch = () => {
      const controller = useSingle<NestedValue>('test', {endpoint: '#'})
      useLayoutEffect(() => {
        expect(controller.p.a.model).toBe(undefined)
      }, [])
    }
    ctxRender(<CodeRunner code={undefinedPatch} />, {store})
  })
  it('Returns a clone of the value when it is an object', () => {
    const returnClone = () => {
      const controller = useSingle<NestedValue>('test', {endpoint: '#', x: {a: {b: 4}}})
      useLayoutEffect(() => {
        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        expect(controller.x!.a).toEqual(controller.p.a.model)
        expect(controller.x!.a).not.toBe(controller.p.a.model)
        /* eslint-enable @typescript-eslint/no-non-null-assertion */
      }, [])
    }
    ctxRender(<CodeRunner code={returnClone} />, {store})
  })
  it('Serializes to JSON', () => {
    const serializerPatch = () => {
      const controller = useSingle<NestedValue>('test', {endpoint: '#', x: {a: {b: 4}}})
      useLayoutEffect(() => {
        expect(JSON.parse(JSON.stringify(controller.p.a))).toEqual({
          attrName: 'a',
          controller: 'single.test',
          moduleType: 'patcher',
          rawValue: {b: 4}
        })
      }, [])
    }
    ctxRender(<CodeRunner code={serializerPatch} />, {store})
  })
  it('Does not consider itself dirty if set to upstream value', () => {
    const dirtyCheck = () => {
      const controller = useSingle<TestType>('test', {endpoint: '#', x: {a: 'Wat'}})
      useLayoutEffect(() => {
        controller.p.a.model = 'Things'
        expect(controller.p.a.dirty).toBe(true)
        controller.p.a.model = 'Wat'
        expect(controller.p.a.dirty).toBe(false)
        controller.p.a.debouncedRawSet.flush()
        // We shouldn't call the remote endpoint if we've determined we didn't actually change.
        expect(mockAxios.request).not.toHaveBeenCalled()
      }, [])
    }
    ctxRender(<CodeRunner code={dirtyCheck} />, {store})
  })
  it('Logs an error if setting on an unloaded model', () => {
    const unloadedPatch = () => {
      const controller = useSingle<TestType>('test', {endpoint: '#'})
      useLayoutEffect(() => {
        controller.p.a.model = 'Things'
        controller.p.a.debouncedRawSet.flush()
        expect(mockError).toHaveBeenCalledWith(
          'Cannot set undefined key on model. Attempted to set a on single.test, null',
        )
      }, [])
    }
    ctxRender(<CodeRunner code={unloadedPatch} />, {store})
  })
  it('Indicates whether or not the patcher\'s value is loaded', () => {
    const indicateLoaded = () => {
      const controller = useSingle<TestType>('test', {endpoint: '#'})
      useLayoutEffect(() => {
        expect(controller.p.a.loaded).toBe(false)
        controller.x = {a: 'test'}
        expect(controller.p.a.loaded).toBe(true)
      }, [])
    }
    ctxRender(<CodeRunner code={indicateLoaded} />, {store})
  })
})
