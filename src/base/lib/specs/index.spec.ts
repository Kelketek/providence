import {
  buildNestedPath, completeAssign,
  createPath,
  baseDeriveErrors,
  explodeName,
  flattenNamespace,
  immediate,
  isObject,
  retrieveName
} from '../index'
import {AxiosError} from 'axios'

describe('Namespace handling', () => {
  it('Does little to a sufficiently simple namespace', () => {
    expect(flattenNamespace(['test'])).toEqual('test')
  })
  it('Sets the simplest namespace in an array', () => {
    expect(explodeName('test')).toEqual(['test'])
  })
  it('Flattens a namespace with escapes', () => {
    expect(flattenNamespace(['test.test', 'test'])).toEqual('test%2Etest.test')
  })
  it('Explodes a namespace', () => {
    expect(explodeName('test%2Etest.test')).toEqual(['test.test', 'test'])
  })
  // Creating this constant since JS will freak out about octal values depending on how we compose the string literally.
  const period = '%2E'
  it.each`
    testArray
    ${['test\\\\thing.test\\.thing']}
    ${['I&BWF$IBYwefb  dfber ergib.', 'sdkfuwbef is']}
    ${['%\\2\\\\\\%' + period, period, '\\\\\\' + period + '.%', '\\\\\\%.', '\\%.', '\\.', 
       '\\.', '.', '.test%.' + period + '%' + period + '\\%\\%\\2E']}
  `("Should forward and reverse the input $testArray", ({testArray}: {testArray: string[]}) => {
    expect(explodeName(flattenNamespace(testArray))).toEqual(testArray)
  })
})

describe('immediate', () => {
  it('Handles an immediate promise return', async () => {
    const testValue = {'test': 'value'}
    immediate(testValue).then((response) => expect(response).toBe(testValue))
  })
})

describe('isObject', () => {
  it.each`
    testSource | result
    ${{a: 1}} | ${true}
    ${null} | ${false}
    ${[]} | ${false}
    ${'test'} | ${false}
  `("Should indicate $result when asked if $testSource is an object.",
    ({testSource, result}: {testSource: any, result: boolean}) => {
    expect(isObject(testSource)).toBe(result)
  })
})

describe('retrieveName', () => {
  const target = {a: {b: {c: 'Test'}}}
  it('Retrieves a dotted name path from an object.', () => {
    expect(retrieveName(target, ['a', 'b', 'c'])).toBe('Test')
  })
  it('Throws when given a non-existent path', () => {
    expect(() => retrieveName(target, ['a', 'z', 'y'])).toThrowErrorMatchingInlineSnapshot('"Property a.z is not defined."')
  })
  it('Returns undefined when given a non-existent path in silent mode.', () => {
    expect(retrieveName(target, ['a', 'z', 'y'], true)).toBe(undefined)
  })
})

describe('createPath', () => {
  it('Creates simple entries', () => {
    const singleton = {}
    createPath(singleton, ['test', 'foo', 'bar'], () => ({}))
    expect(singleton).toEqual({'test': {'foo': {'bar': {}}}})
  })
  it('Creates complex entries', () => {
    const singleton = {}
    createPath(singleton, ['test', 'foo', 'bar'], () => ({'stuff': 'things'}))
    expect(singleton).toEqual({
      test: {
        stuff: 'things',
        foo: {
          stuff: 'things',
          bar: {
            stuff: 'things',
          }
        }
      }
    })
  })
  it('Creates its own scaffolded path', () => {
    const singleton = {}
    createPath(singleton, ['test', 'children', 'foo', 'children', 'bar'], () => ({children: {}}))
    expect(singleton).toEqual({
      test: {
        children: {
          foo: {
            children: {
              bar: {
                children: {}
              }
            }
          }
        }
      }
    })
  })
  it('Returns the correct object for modification', () => {
    const singleton = {}
    const target = createPath(singleton, ['test', 'children', 'foo', 'children', 'bar'], () => ({children: {}}))
    /* eslint-disable @typescript-eslint/ban-ts-comment */
    // @ts-ignore eslint-disable-line
    target.baz = 'wat'
    /* eslint-enable @typescript-eslint/ban-ts-comment */
    expect(singleton).toEqual({
      test: {
        children: {
          foo: {
            children: {
              bar: {
                children: {},
                baz: 'wat',
              }
            }
          }
        }
      }
    })
  })
  it('Throws if start is not an object', () => {
    expect(() => createPath(undefined, ['path', 'to', 'thing'], () => ({children: {}}))).toThrowErrorMatchingInlineSnapshot('"Starting object is not an object. Cannot define new entries. Was: undefined"')
  })
})

describe('nestedPath', () => {
  const path = ['test', 'foo', 'bar']
  expect(buildNestedPath(path, 'tasks')).toEqual(['test', 'tasks', 'foo', 'tasks', 'bar'])
})

const mockError = (errorStructure: any): AxiosError => {
  return {
    config: {},
    isAxiosError: true,
    name: 'TestError',
    message: 'Test Message',
    toJSON: () => errorStructure,
    ...errorStructure
  }
}

describe('baseDeriveErrors', () => {
  const mockConsoleError = jest.spyOn(console, 'error')
  beforeEach(() => {
    mockConsoleError.mockReset()
  })
  it('Derives errors for known fields', () => {
    const result = baseDeriveErrors(mockError(
      {
        response: {
          data: {stuff: ['Not enough stuff']}
        }}), ['stuff', 'things'])
    expect(result.fields.stuff).toEqual(['Not enough stuff'])
    expect(result.fields.things).toBe(undefined)
    expect(result.errors).toEqual([])
  })
  it('Adds to the general errors when receiving a field error it does not recognize', () => {
    const result = baseDeriveErrors(mockError(
      {
        response: {
          data: {stuff: ['Not enough stuff']}
        }}), ['things'])
    expect(result.fields.stuff).toEqual(undefined)
    expect(result.errors).toEqual([
      'Whoops! We had a coding error. Please contact support and tell them the following: stuff: Not enough stuff',
    ])
  })
  it('Recognizes a default "detail" field for general errors', () => {
    const result = baseDeriveErrors(mockError(
      {
        response: {
          data: {detail: 'Not enough stuff'}
        }}), ['things'])
    expect(result.fields.stuff).toBe(undefined)
    expect(result.errors).toEqual([
      'Not enough stuff',
    ])
  })
  it('Translates known network errors', () => {
    const result = baseDeriveErrors(mockError(
      {
        code: 'ECONNABORTED',
      }), ['things'])
    expect(result.fields.stuff).toBe(undefined)
    expect(result.errors).toEqual([
      'Timed out or aborted. Please try again or contact support.',
    ])
  })
  it('Translates unknown network errors', () => {
    const result = baseDeriveErrors(mockError(
      {
        code: 'EPLURIBUSUNUM',
      }), ['things'])
    expect(result.fields.stuff).toBe(undefined)
    expect(result.errors).toEqual([
      'We had an issue contacting the server. Please try again later.',
    ])
  })
})

describe('completeAssign', () => {
  it('Performs a basic assignment', () => {
    const target: {[key: string]: string} = {}
    completeAssign(target, {stuff: 'things'})
    expect(target.stuff).toBe('things')
  })
  it('Performs assignment of getters and setters', () => {
    let flag = false
    const target: {[key: string]: boolean} = {}
    const newProps = {
      get flag() {
        return flag
      },
      set flag(val: boolean) {
        flag = val
      }
    }
    completeAssign(target, newProps)
    expect(target.flag).toBe(false)
    flag = true
    expect(target.flag).toBe(true)
    target.flag = false
    expect(target.flag).toBe(false)
  })
  it('Performs assignment of symbols', () => {
    const target: {[key: symbol]: string} = {}
    const key = Symbol('stuff')
    const newProps = {
      [key]: 'things'
    }
    completeAssign(target, newProps)
    expect(target[key]).toBe('things')
  })
})