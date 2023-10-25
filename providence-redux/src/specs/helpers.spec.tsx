import {createStore, IModuleStore} from 'redux-dynamic-modules'
import {GlobalOptions} from '@opencraft/providence/base/types/GlobalOptions'
import {ctxRender, getList} from './helpers'
import {defaultContextValues} from '../context'
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
    const controller = getList<TestType>('testList', {endpoint: '#'}, {store, context})
    await controller.makeReady([{id: 1, text: 'Beep'}, {id: 2, text: 'Boop'}])
    const ui = <Lister listName={'testList'} listOpts={{endpoint: '#'}}/>
    const result = ctxRender(ui, {context, store})
    expect(result.queryAllByText('{"id":1,"text":"Beep"}').length).toBe(1)
    act(() => {controller.makeReady([])})
    expect(result.queryAllByText('{"id":1,"text":"Beep"}').length).toBe(0)
  })
})
