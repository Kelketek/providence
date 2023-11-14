# Testing in Redux

In order to test your components using providence, it would be useful to preload or manipulate the state on your controllers. However, since the controllers and their state are created using hooks, it's difficult to access controllers outside the React environment itself.

Thankfully, Providence comes with a set of helper functions to assist you. Each of the major hooks comes with a testing version that can perform the same operations as the real hooks, but using an arbitrary settings object.

By using the same settings object as your components use in their ProvidenceContext, you can manipulate the state as part of your tests to verify they behave as you expect.

These functions are prefixed with `get` instead of `use` to make them distinct, and to note the fact they are **not** React hooks, and aren't subject to their limitations.

## Example

Here's an example of how you might set up and use `getSingle`, for instance:

=== "TypeScript"

    ```typescript
    import {createStore, IModuleStore} from 'redux-dynamic-modules'
    // You may find several functions in Providence's internal test helpers instructive.
    import {flushPromises, rq, rs, waitFor} from '@opencraft/providence/base/lib/testHelpers'
    import {getSingle} from '@opencraft/providence-redux/testHelpers'
    import {defaultContextValues} from '@opencraft/providence-redux/context'
    // We use mockAxios for this test: https://www.npmjs.com/package/jest-mock-axios
    import mockAxios from 'jest-mock-axios'
    
    
    declare type MultipleProps = {
      a: string,
      b: number,
    }
    
    
    describe('SingleController', () => {
      beforeEach(() => {
        mockAxios.reset()
        store = createStore({})
        context = defaultContextValues()
      })
      it('Patches a resource', async () => {
        const {controller} = getSingle<MultipleProps>('test', {endpoint: '/test/', x: {a: 'stuff', b: 3}}, {store, context})
        controller.patch({b: 4})
        expect(mockAxios.request).toHaveBeenCalledWith(rq('/test/', 'patch', {b: 4}))
        expect(mockAxios.request).toHaveBeenCalledTimes(1)
        mockAxios.mockResponse(rs({a: 'stuff', b: 5}))
        await flushPromises()
        expect(controller.x).toEqual({a: 'stuff', b: 5})
      })
    })
    ```

=== "JavaScript"

    ```javascript
    import {createStore, IModuleStore} from 'redux-dynamic-modules'
    // You may find several functions in Providence's internal test helpers instructive.
    import {flushPromises, rq, rs, waitFor} from '@opencraft/providence/testHelpers'
    import {getSingle} from '@opencraft/providence-redux/testHelpers'
    import {defaultContextValues} from '@opencraft/providence-redux/context'
    // We use mockAxios for this test: https://www.npmjs.com/package/jest-mock-axios
    import mockAxios from 'jest-mock-axios'
    
    
    describe('SingleController', () => {
      beforeEach(() => {
        mockAxios.reset()
        store = createStore({})
        context = defaultContextValues()
      })
      it('Patches a resource', async () => {
        const {controller} = getSingle('test', {endpoint: '/test/', x: {a: 'stuff', b: 3}}, {store, context})
        controller.patch({b: 4})
        expect(mockAxios.request).toHaveBeenCalledWith(rq('/test/', 'patch', {b: 4}))
        expect(mockAxios.request).toHaveBeenCalledTimes(1)
        mockAxios.mockResponse(rs({a: 'stuff', b: 5}))
        await flushPromises()
        expect(controller.x).toEqual({a: 'stuff', b: 5})
      })
    })
    ```

## Rendering components with ProvidenceContext

Used the above technique with react-testing-library, you can observe how things change in your rendered components when the state changes.

You will want to render your components wrapped in the ProvidenceProvider, in much the same way they're rendered normally. For an example of this, check out [ctxRender](../reference/providence-redux/functions/lib_testHelpers.ctxRender.md), included in the testing utilities.

=== "TypeScript"

    ```typescript
    import {createStore, IModuleStore} from 'redux-dynamic-modules'
    import {GlobalOptions} from '@opencraft/providence/types/GlobalOptions'
    import {ctxRender, getList} from './helpers'
    import {defaultContextValues} from './context'
    import {Lister} from './Lister'
    import {act} from "@testing-library/react";
    
    let store: IModuleStore<any>
    let context: GlobalOptions
    
    declare type TestType = {
      id: number,
      text: string,
    }
    
    describe('Testing Utils', () => {
      beforeEach(() => {
        store = createStore({})
        context = defaultContextValues()
      })
      it('Allows the helper functions to mix in and out of rendering contexts.', async () => {
        const {controller} = getList<TestType>('testList', {endpoint: '#'}, {store, context})
        await controller.makeReady([{id: 1, text: 'Beep'}, {id: 2, text: 'Boop'}])
        const ui = <Lister listName={'testList'} listOpts={{endpoint: '#'}}/>
        // You'll want to make your own render function depending on what providers
        // And other React features your product uses. The included ctxRender function can be used
        // as an example of how to build your own providence-aware one.
        const result = ctxRender(ui, {context, store})
        expect(result.queryAllByText('{"id":1,"text":"Beep"}').length).toBe(1)
        // Be sure, once you've rendered your component, that you wrap changes via controllers in
        // act() calls. This makes sure all pending React changes are rendered before continuing.
        act(() => {controller.makeReady([])})
        expect(result.queryAllByText('{"id":1,"text":"Beep"}').length).toBe(0)
      })
    })
    ```

=== "JavaScript"

    ```javascript
    import {createStore, IModuleStore} from 'redux-dynamic-modules'
    import {ctxRender, getList} from './helpers'
    import {defaultContextValues} from '../context'
    import {Lister} from './Lister'
    import {act} from "@testing-library/react";
    
    
    
    describe('Testing Utils', () => {
      beforeEach(() => {
        store = createStore({})
        context = defaultContextValues()
      })
      it('Allows the helper functions to mix in and out of rendering contexts.', async () => {
        const {controller} = getList('testList', {endpoint: '#'}, {store, context})
        await controller.makeReady([{id: 1, text: 'Beep'}, {id: 2, text: 'Boop'}])
        const ui = <Lister listName={'testList'} listOpts={{endpoint: '#'}}/>
        // You'll want to make your own render function depending on what providers
        // And other React features your product uses. The included ctxRender function can be used
        // as an example of how to build your own providence-aware one.
        const result = ctxRender(ui, {context, store})
        expect(result.queryAllByText('{"id":1,"text":"Beep"}').length).toBe(1)
        // Be sure, once you've rendered your component, that you wrap changes via controllers in
        // act() calls. This makes sure all pending React changes are rendered before continuing.
        act(() => {controller.makeReady([])})
        expect(result.queryAllByText('{"id":1,"text":"Beep"}').length).toBe(0)
      })
    })
    ```
