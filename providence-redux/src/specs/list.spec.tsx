import {createStore, IModuleStore} from 'redux-dynamic-modules'
import {ctxRender} from './helpers'
import {CodeRunner} from './CodeRunner'
import {useList} from '../hooks'
import mockAxios from 'jest-mock-axios'
import {useLayoutEffect} from 'react'
import {SingleController} from '@opencraft/providence/base/singles/types/SingleController'
import {defaultContextValues} from '../context'
import {ListState} from '@opencraft/providence/base/lists/types/ListState'
import {flushPromises, rq, rs, waitFor} from '@opencraft/providence/base/specs/helpers'
import {act} from "@testing-library/react";

let store: IModuleStore<any>

function listState(overrides?: Partial<ListState<any>>) {
  return {
    name: 'list.test',
    endpoint: '/test/',
    failed: false,
    fetching: false,
    grow: false,
    keyProp: 'id',
    params: {page: '1', size: '24'},
    persistent: false,
    pageInfo: null,
    paginated: true,
    ready: false,
    refs: [],
    reverse: false,
    errors: {status: '', messages: []},
    ...overrides,
  }
}

const makeList = () => {
  useList('test', {endpoint: '/test/'})
}

declare interface TestType {
  id: number,
  a: string,
}

const mockWarn = jest.spyOn(console, 'warn')

describe('List module handling', () => {
  beforeEach(() => {
    mockAxios.reset()
    store = createStore({})
  })
  afterEach(() => {
    mockWarn.mockReset()
  })
  it('Creates a list module', async () => {
    await ctxRender(<CodeRunner code={makeList}/>, {store})
    expect(store.getState()).toEqual({'list.test': listState()})
  })
  it('Handles interleaving list items.', async() => {
    let singleController: SingleController<TestType>
    const fetchAndBuild = () => {
      const controller = useList<TestType>('test', {endpoint: '/test/'})
      useLayoutEffect(() => {
        controller.makeReady([
          {a: 'stuff', id: 1},
          {a: 'things', id: 2},
          {a: 'wat', id: 3},
          {a: 'do', id: 4},
        ])
        // Should be id 2.
        singleController = controller.list[1]
        controller.rawList = [
          // New string value.
          {a: 'dude', id: 2},
          {a: 'Beep', id: 5},
        ]
        expect(singleController.x).toEqual({a: 'dude', id: 2})
      }, [])
      // The new string value should appear on the next render if it doesn't on this one, since the controller should
      // be the same controller, and the module should have been updated.
      /* eslint-disable @typescript-eslint/ban-ts-comment */
      // @ts-ignore
      return singleController && singleController.x
      /* eslint-enable @typescript-eslint/ban-ts-comment */
    }
    const result = ctxRender(<CodeRunner code={fetchAndBuild} renderResult={true} />, {store})
    expect(mockAxios.request).toHaveBeenCalledTimes(0)
    await flushPromises()
    await waitFor(
      () => !!result.getByText(JSON.stringify({a: 'dude', id: 2})),
      'The list data is displayed.',
    )
  })
  it('Cleans up its listener references when the underlying list has changed', async ()=> {
    const globalOptions = defaultContextValues()
    const fetchAndBuild = () => {
      const controller = useList<TestType>('test', {endpoint: '/test/'})
      useLayoutEffect(() => {
        controller.makeReady([
          {a: 'stuff', id: 1},
          {a: 'things', id: 2},
          {a: 'wat', id: 3},
          {a: 'do', id: 4},
        ])
        // Force list to be generated.
        controller.list
        controller.dispatch(
          'setList', [
            // New string value.
            {a: 'dude', id: 2},
            {a: 'Beep', id: 5},
          ])
        // And regenerated.
        controller.list
        const registries = globalOptions.registries()
        expect(registries.single.list.children.test.children['1']).toBeUndefined()
        expect(registries.single.list.children.test.children['2'].listeners.includes(controller.uid))
      }, [])
    }
    ctxRender(<CodeRunner code={fetchAndBuild} />, {store, context: globalOptions})
  })
  it('Gives a warning when a single has been removed pre-emptively',async () => {
    const globalOptions = defaultContextValues()
    const warnMissing = () => {
      const controller = useList<TestType>('test', {endpoint: '/test/'})
      mockWarn.mockImplementation(() => undefined)
      useLayoutEffect(() => {
        controller.makeReady([{a: 'stuff', id: 1}])
        const registries = globalOptions.registries()
        registries.single.list.children.test.children['1'].remover!()  // eslint-disable-line @typescript-eslint/no-non-null-assertion
        delete registries.single.list.children.test.children['1']
        controller.rawList = []
        expect(mockWarn).toHaveBeenCalledWith(`Attempted to remove list item list.test.1, but it was already removed!`)
      }, [])
    }
    ctxRender(<CodeRunner code={warnMissing}/>, {store, context: globalOptions})
  })
  it('Has useful JSON representation',async () => {
    const makeJson = () => {
      const controller = useList<TestType>('test', {endpoint: '/test/'})
      useLayoutEffect(() => {
        controller.rawList = [{a: 'stuff', id: 1}, {a: 'dude', id: 2}]
        expect(JSON.stringify(controller)).toEqual(JSON.stringify( {
          controller: 'list.test',
          moduleType: 'list',
          list: [{a: 'stuff', id: 1}, {a: 'dude', id: 2}]}
        ))
      }, [])
    }
    ctxRender(<CodeRunner code={makeJson}/>, {store})
  })
  it('Explodes a namespace',async () => {
    const getNamespace = () => {
      const controller = useList<TestType>('test', {endpoint: '/test/'})
      expect(controller.namespace).toEqual(['list', 'test'])
    }
    ctxRender(<CodeRunner code={getNamespace}/>, {store})
  })

})

describe('List tasks', () => {
  beforeEach(() => {
    mockAxios.reset()
    store = createStore({})
  })
  afterEach(() => {
    mockWarn.mockReset()
  })
  it('Creates list items from a paginated fetch request', async() => {
    const fetchAndBuild = () => {
      const controller = useList<TestType>('test', {endpoint: '/test/'})
      useLayoutEffect(() => {
        controller.getOnce()
        // Cheap additional thing to test-- get should only get called once.
        controller.getOnce()
      }, [])
      return controller.rawList
    }
    const result = ctxRender(<CodeRunner code={fetchAndBuild} renderResult={true} />, {store})
    expect(mockAxios.request).toHaveBeenCalledWith(
      rq('/test/', 'get', undefined, {
        params: {size: '24', page: '1'}, signal: expect.any(AbortSignal)
      })
    )
    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    act(() => mockAxios.mockResponse(rs({results: [{a: 'stuff', id: 1}, {a: 'things', id: 2}], count: 2, size: 20})))
    await flushPromises()
    await waitFor(
      () => !!result.getByText(JSON.stringify([{a: 'stuff', id: 1}, {a: 'things', id: 2}])),
      'The list data is displayed.',
    )
  })
  it('Creates list items from an unpaginated fetch request', async() => {
    const fetchAndBuildPaginated = () => {
      const controller = useList<TestType>('test', {endpoint: '/test/', paginated: false})
      useLayoutEffect(() => {
        controller.getOnce()
      }, [])
      return controller.rawList
    }
    const result = ctxRender(<CodeRunner code={fetchAndBuildPaginated} renderResult={true} />, {store})
    expect(mockAxios.request).toHaveBeenCalledWith(rq('/test/', 'get'))
    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    act(() => mockAxios.mockResponse(rs([{a: 'stuff', id: 1}, {a: 'things', id: 2}])))
    await flushPromises()
    await waitFor(
      () => !!result.getByText(JSON.stringify([{a: 'stuff', id: 1}, {a: 'things', id: 2}])),
      'The list data is displayed.',
    )
  })
  it('Handles a fetching failure',async () => {
    const fetchFail = () => {
      const controller = useList<TestType>('test', {endpoint: '/test/'})
      useLayoutEffect(() => {
        expect(controller.failed).toBe(false)
        expect(controller.ready).toBe(false)
        controller.get().then(() => {
          throw Error('Succeeded when we should not have!')
        }).catch(() => {
          expect(controller.failed).toBe(true)
          expect(controller.ready).toBe(false)
        })
        mockAxios.mockError(Error('Stuff broke'))
        flushPromises()
      }, [])
      return controller.rawList
    }
    ctxRender(<CodeRunner code={fetchFail}/>, {store})
  })
  it('Performs a post request',async () => {
    const postToList = () => {
      const controller = useList<TestType>('test', {endpoint: '/test/'})
      const value: {[key: string]: string} = {stuff: 'things'}
      useLayoutEffect(() => {
        controller.post({test: 'thing'}).then((response) => {
          expect(response.data).toEqual(value)
        })
        mockAxios.mockResponse(rs(value))
        flushPromises()
      }, [])
      return controller.rawList
    }
    ctxRender(<CodeRunner code={postToList}/>, {store})
  })
  it('Grows a list upon fetching', async () => {
    const growingList = () => {
      const controller = useList<TestType>('test', {endpoint: '/test/', grow: true})
      expect(controller.grow).toBe(true)
      useLayoutEffect(() => {
        controller.rawList = [
          {a: 'stuff', id: 1},
          {a: 'wat', id: 2},
        ]
        controller.get().then(() => {
          expect(controller.rawList).toEqual([
            {a: 'stuff', id: 1},
            {a: 'wat', id: 2},
            {a: 'dude', id: 3},
            {a: 'sweet', id: 4},
          ])
        })
        mockAxios.mockResponse(rs({results: [{a: 'dude', id: 3}, {a: 'sweet', id: 4}], size: 2, count: 4}))
        flushPromises()
      }, [])
    }
    ctxRender(<CodeRunner code={growingList}/>, {store})
  })
  it('Grows a list in reverse upon fetching', async () => {
    const growingList = () => {
      const controller = useList<TestType>('test', {endpoint: '/test/', grow: true, reverse: true})
      useLayoutEffect(() => {
        controller.rawList = [
          {a: 'wat', id: 2},
          {a: 'stuff', id: 1},
        ]
        controller.get().then(() => {
          expect(controller.rawList).toEqual([
            {a: 'sweet', id: 4},
            {a: 'dude', id: 3},
            {a: 'wat', id: 2},
            {a: 'stuff', id: 1},
          ])
          expect(controller.pageInfo).toEqual({size: 2, count: 4})
        })
        mockAxios.mockResponse(rs({results: [{a: 'dude', id: 3}, {a: 'sweet', id: 4}], size: 2, count: 4}))
        flushPromises()
      }, [])
    }
    ctxRender(<CodeRunner code={growingList}/>, {store})
  })
  it('Prefixes the list', async () => {
    const prefixedList = () => {
      const controller = useList<TestType>('test', {endpoint: '/test/'})
      useLayoutEffect(() => {
        controller.rawList = [
          {a: 'wat', id: 2},
          {a: 'stuff', id: 1},
        ]
        controller.prefix([
          {a: 'sweet', id: 4},
          {a: 'dude', id: 3},
        ])
        expect(controller.rawList).toEqual([
          {a: 'sweet', id: 4},
          {a: 'dude', id: 3},
          {a: 'wat', id: 2},
          {a: 'stuff', id: 1},
        ])
      }, [])
    }
    ctxRender(<CodeRunner code={prefixedList}/>, {store})
  })
  it('Extends the list', async () => {
    const extendedList = () => {
      const controller = useList<TestType>('test', {endpoint: '/test/'})
      useLayoutEffect(() => {
        controller.rawList = [
          {a: 'stuff', id: 1},
          {a: 'wat', id: 2},
        ]
        controller.extend([
          {a: 'dude', id: 3},
          {a: 'sweet', id: 4},
        ])
        expect(controller.rawList).toEqual([
          {a: 'stuff', id: 1},
          {a: 'wat', id: 2},
          {a: 'dude', id: 3},
          {a: 'sweet', id: 4},
        ])
      }, [])
    }
    ctxRender(<CodeRunner code={extendedList}/>, {store})
  })
  it('Sets and retrieves page settings', async () => {
    const extendedList = () => {
      const controller = useList<TestType>('test', {endpoint: '/test/'})
      useLayoutEffect(() => {
        expect(controller.grow).toBe(false)
        controller.grow = true
        expect(controller.grow).toBe(true)
        expect(controller.pageInfo).toBe(null)
        controller.pageInfo = {count: 4, size: 2}
        expect(controller.pageInfo).toEqual({count: 4, size: 2})
        expect(controller.count).toEqual(4)
        expect(store.getState()[controller.name]).toEqual(
          listState({pageInfo: {count: 4, size: 2}, grow: true}),
        )
      }, [])
    }
    ctxRender(<CodeRunner code={extendedList}/>, {store})
  })
  it('Retrieves the module state', async () => {
    const extendedList = () => {
      const controller = useList<TestType>('test', {endpoint: '/test/'})
      expect(controller.rawState).toEqual(listState())
    }
    ctxRender(<CodeRunner code={extendedList}/>, {store})
  })
  it('Gets and sets the page value', async () => {
    const getSetPage = () => {
      const controller = useList<TestType>('test', {endpoint: '/test/'})
      useLayoutEffect(() => {
        expect(controller.currentPage).toEqual(1)
        controller.setPage(2)
        expect(controller.currentPage).toEqual(2)
        expect(mockAxios.request).not.toHaveBeenCalled()
        controller.currentPage = 3
        expect(mockAxios.request).toHaveBeenCalledWith(
          rq('/test/', 'get', undefined, {
            params: {size: '24', page: '3'}, signal: expect.any(AbortSignal)
          })
        )
      }, [])
    }
    ctxRender(<CodeRunner code={getSetPage}/>, {store})
  })
  it('Verifies empty status', async () => {
    const verifyEmpty = () => {
      const controller = useList<TestType>('test', {endpoint: '/test/'})
      useLayoutEffect(() => {
        expect(controller.empty).toBe(false)
        controller.makeReady([])
        expect(controller.empty).toBe(true)
        controller.rawList = [{a: 'stuff', id: 1}]
        expect(controller.empty).toBe(false)
        controller.rawList = []
        controller.setPage(3)
        expect(controller.empty).toBe(false)
      }, [])
    }
    ctxRender(<CodeRunner code={verifyEmpty}/>, {store})
  })
  it('Gets total page count', async () => {
    const verifyEmpty = () => {
      const controller = useList<TestType>('test', {endpoint: '/test/'})
      useLayoutEffect(() => {
        expect(controller.totalPages).toBe(null)
        controller.pageInfo = {
          size: 24,
          count: 48,
        }
        expect(controller.totalPages).toBe(2)
        controller.pageInfo = {
          size: 24,
          count: 0,
        }
        expect(controller.totalPages).toBe(1)
      }, [])
    }
    ctxRender(<CodeRunner code={verifyEmpty}/>, {store})
  })
  it('Handles pagination accessors sanely for a non-paginated list', async () => {
    const verifyEmpty = () => {
      const controller = useList<TestType>('test', {endpoint: '/test/', paginated: false})
      useLayoutEffect(() => {
        expect(controller.totalPages).toBe(null)
        expect(controller.currentPage).toBe(1)
        expect(controller.totalPages).toBe(null)
        controller.pageInfo = {
          size: 24,
          count: 0,
        }
        expect(controller.totalPages).toBe(null)
      }, [])
    }
    ctxRender(<CodeRunner code={verifyEmpty}/>, {store})
  })
})
