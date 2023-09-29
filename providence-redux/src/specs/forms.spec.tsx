// Adds initial patcher settings to state from runtime data if they don't already exist.
import {FormState} from '@opencraft/providence/forms/types/FormState'
import {FieldSet} from '@opencraft/providence/forms/types/FieldSet'
import {fieldDefaults} from '@opencraft/providence/forms'
import mockAxios from 'jest-mock-axios'
import {createStore, IModuleStore} from 'redux-dynamic-modules'
import {ctxRender, getForm} from './helpers'
import {CodeRunner} from './CodeRunner'
import {useForm} from '../index'
import {useLayoutEffect} from 'react'
import {defaultContextValues} from '../context'
import {nop} from '@opencraft/providence/lib'
import {rs} from '@opencraft/providence/specs/helpers';
import {GlobalOptions} from '@opencraft/providence/types/GlobalOptions';

let store: IModuleStore<any>
let context: GlobalOptions

export const fieldsFromObject = <T extends object,>(x: T) => {
  const result: Partial<FieldSet<T>> = {}
  for (const key of Object.keys(x)) {
    const item = key as string & keyof typeof x
    result[item] = {...fieldDefaults(), initialValue: x[item], value: x[item]}
  }
  return result as FieldSet<T>
}

export function formState<T extends object>(name = 'form.test', overrides?: Partial<FormState<any>> & {x?: T}) {
  let fields: FieldSet<any>
  if (overrides && overrides.x) {
    fields = fieldsFromObject(overrides.x)
  } else {
    fields = {}
  }
  const remaining = {...overrides}
  delete remaining.x
  return {
    [name]: {
      name,
      endpoint: '#',
      sending: false,
      persistent: false,
      disabled: false,
      fields,
      method: 'post',
      step: 1,
      errors: {status: '', messages: []},
      ...remaining,
    },
  }
}

const makeForm = () => {
  return useForm('test', {fields: {name: {value: 'Boop'}, age: {value: 20}}, endpoint: '#'})
}

describe('Form module handling', () => {
  beforeEach(() => {
    mockAxios.reset()
    store = createStore({})
    context = defaultContextValues()
  })
  it('Creates a form module', async () => {
    ctxRender(<CodeRunner code={makeForm}/>, {store})
    expect(store.getState()).toEqual(formState('form.test', {x: {name: 'Boop', age: 20}}))
  })
  it('Generates fielders', async () => {
    const fielderCheck = () => {
      const form = makeForm()
      expect(form.f.name.model).toEqual('Boop')
      expect(form.f.age.model).toEqual(20)
    }
    ctxRender(<CodeRunner code={fielderCheck}/>, {store})
  })
  it('Returns the same function across memoized calls', async () => {
    const fielderValidate = () => {
      const form = useForm('test', {endpoint: '#', fields: {email: {value: '', validators: [{name: 'email'}]}}})
      useLayoutEffect(() => {
        expect(form.f.email.validate).toBe(form.f.email.validate)
      }, [])
    }
    ctxRender(<CodeRunner code={fielderValidate}/>, {store})
  })
  it('Stores and retrieves simple attributes', async () => {
    const attributeVerification = () => {
      const controller = makeForm()
      useLayoutEffect(() => {
        expect(store.getState()).toEqual(formState('form.test', {x: {name: 'Boop', age: 20}}))
        expect(controller.endpoint).toBe('#')
        controller.endpoint = '/test/'
        expect(controller.endpoint).toBe('/test/')
        expect(controller.method).toBe('post')
        controller.method = 'patch'
        expect(controller.method).toBe('patch')
        expect(controller.moduleType).toBe('form')
        expect(controller.namespace).toEqual(['form', 'test'])
        expect(controller.step).toBe(1)
        controller.step = 2
        expect(controller.step).toBe(2)
        expect(controller.sending).toBe(false)
        controller.sending = true
        expect(controller.sending).toBe(true)
        expect(store.getState()).toEqual(
          formState('form.test', {
            endpoint: '/test/',
            method: 'patch',
            x: {name: 'Boop', age: 20},
            step: 2,
            sending: true,
          }),
        )
      }, [])
    }
    ctxRender(<CodeRunner code={attributeVerification}/>, {store})
  })
  it('Handles added and removed fields', async () => {
    const fieldManipulation = () => {
      const controller = makeForm()
      useLayoutEffect(() => {
        expect(controller.f.age.rawValue).toBe(20)
        controller.delFields(['age'])
        expect(controller.f.age).toBeUndefined()
        controller.addFields({age: {value: 20}})
        expect(controller.f.age.rawValue).toBe(20)
      }, [])
    }
    ctxRender(<CodeRunner code={fieldManipulation}/>, {store})
  })
  it('Submits a form', async () => {
    const submitForm = () => {
      const targetData = {name: 'Fox', library: 'providence'}
      const controller = useForm('test', {
        endpoint: '/test/',
        fields: {
          name: {value: 'Fox', omitIf: ''},
          age: {value: 33, omitIf: 33},
          library: {value: 'providence'},
        }
      })
      useLayoutEffect(() => {
        controller.submit().then(() => {
          expect(mockAxios.request).toHaveBeenCalledWith({
            url: '/test/',
            data: targetData,
            method: 'post',
            signal: expect.any(AbortSignal),
          })
        })
        const request = mockAxios.getReqByUrl('/test/')
        expect(request.data).toEqual(targetData)
        mockAxios.mockResponse(rs({}), request)
      }, [])
    }
    ctxRender(<CodeRunner code={submitForm}/>, {store})
  })
  it('Handles an error upon submission', async () => {
    const controller = getForm(
      'test', {
      endpoint: '/test/',
      fields: {name: {value: 'Fox', step: 2}, age: {value: 20, step: 1}},
      },
      {store, context}
    )
    controller.submit().then(nop, controller.handleError).then(() => {
      expect(controller.f.name.errors).toEqual(['That name is too cool.'])
      expect(controller.f.age.errors).toEqual([])
      expect(controller.step).toEqual(2)
    })
    const request = mockAxios.getReqByUrl('/test/')
    const err = rs({name: ['That name is too cool.']})
    mockAxios.mockError({response: err}, request)
  })
  it('Sets and retrieves error-related properties', async () => {
    const setErrors = () => {
      const controller = makeForm()
      useLayoutEffect(() => {
        expect(controller.status).toBe('')
        controller.status = '400'
        expect(controller.status).toBe('400')
        expect(controller.errors).toEqual([])
        controller.errors = ['It broke!']
        expect(controller.errors).toEqual(['It broke!'])
        controller.status = '500'
        expect(controller.rawState.errors).toEqual({status: '500', messages: ['It broke!']})
      }, [])
    }
    ctxRender(<CodeRunner code={setErrors}/>, {store})
  })
  it('Resets a form', async () => {
    const resetForm = () => {
      const controller = makeForm()
      useLayoutEffect(() => {
        controller.f.age.model = 50
        expect(controller.f.age.model).toBe(50)
        controller.f.name.model = 'Dude'
        expect(controller.f.name.model).toBe('Dude')
        controller.status = '500'
        expect(controller.status).toBe('500')
        controller.errors = ['Test']
        expect(controller.errors).toEqual(['Test'])
        controller.reset()
        expect(controller.f.name.model).toBe('Boop')
        expect(controller.f.age.model).toBe(20)
        expect(controller.status).toBe('')
        expect(controller.errors).toEqual([])
      }, [])
    }
    ctxRender(<CodeRunner code={resetForm}/>, {store})
  })
  it('Clears errors', async () => {
    const clearErrors = () => {
      const controller = makeForm()
      useLayoutEffect(() => {
        controller.f.age.errors = ['Failed.']
        expect(controller.f.age.errors).toEqual(['Failed.'])
        controller.errors = ['Died']
        expect(controller.errors).toEqual(['Died'])
        controller.status = 'Broken'
        expect(controller.status).toBe('Broken')
        controller.clearErrors()
        expect(controller.f.age.errors).toEqual([])
        expect(controller.status).toEqual('')
        expect(controller.errors).toEqual([])
      }, [])
    }
    ctxRender(<CodeRunner code={clearErrors}/>, {store})
  })
  it('Produces the resulting data', async () => {
    const produceData = () => {
      const controller = makeForm()
      expect(controller.data).toEqual({age: 20, name: 'Boop'})
    }
    ctxRender(<CodeRunner code={produceData}/>, {store})
  })
})

let mockError: jest.SpyInstance

describe('Fielder functionality', () => {
  beforeAll(() => {
    mockError = jest.spyOn(console, 'error')
  })
  beforeEach(() => {
    mockAxios.reset()
    mockError.mockReset()
    store = createStore({})
  })
  it('Validates a field', async () => {
    const fielderValidate = () => {
      const form = useForm('test', {endpoint: '#', fields: {email: {value: '', validators: [{name: 'email'}]}}})
      useLayoutEffect(() => {
        form.f.email.model = 'beep'
        form.f.email.validate.flush().then(() => {
          expect(form.f.email.errors).toEqual(['Emails must contain an @.'])
        })
      }, [])
    }
    ctxRender(<CodeRunner code={fielderValidate}/>, {store})
  })
  it('Complains about unregistered validators', async () => {
    const fielderNoValidator = () => {
      const form = useForm('test', {endpoint: '#', fields: {email: {value: '', validators: [{name: 'turbo'}]}}})
      useLayoutEffect(() => {
        form.f.email.model = 'beep'
        expect(form.f.email.validate.flush().then(() => {
          expect(mockError).toHaveBeenCalledWith('Unregistered validator: turbo\nOptions are: email')
        }))
      }, [])
    }
    ctxRender(<CodeRunner code={fielderNoValidator}/>, {store})
  })
  it('Cancels validation', async () => {
    const fielderNoValidator = () => {
      const form = useForm('test', {endpoint: '#', fields: {email: {value: '', validators: [{name: 'email'}]}}})
      useLayoutEffect(() => {
        form.f.email.model = 'beep'
        form.f.email.cancelValidation()
        expect(form.f.email.validate.flush()).toBeUndefined()
      }, [])
    }
    ctxRender(<CodeRunner code={fielderNoValidator}/>, {store})
  })
  it('Serializes a useful representation to JSON', async () => {
    const jsonCheck = () => {
      const controller = makeForm()
      useLayoutEffect(() => {
        expect(controller.f.age.toJSON()).toEqual({
          controller: 'form.test',
          fieldName: 'age',
          moduleType: 'fielder',
          value: 20,
        })
      }, [])
    }
    ctxRender(<CodeRunner code={jsonCheck}/>, {store})
  })
  it('Gets and sets the debounce setting', async () => {
    const debounceSet = () => {
      const controller = makeForm()
      useLayoutEffect(() => {
        expect(controller.f.age.debounce).toEqual(500)
        controller.f.age.debounce = 200
        expect(controller.f.age.debounce).toEqual(200)
        expect(controller.rawState.fields.age.debounce).toEqual(200)
      }, [])
    }
    ctxRender(<CodeRunner code={debounceSet}/>, {store})
  })
  it('Gets and sets the step', async () => {
    const stepSet = () => {
      const controller = makeForm()
      useLayoutEffect(() => {
        expect(controller.f.age.step).toEqual(1)
        controller.f.age.step = 2
        expect(controller.f.age.step).toEqual(2)
        expect(controller.rawState.fields.age.step).toEqual(2)
      }, [])
    }
    ctxRender(<CodeRunner code={stepSet}/>, {store})
  })
  it('Gets and sets the disabled value', async () => {
    const disabledSet = () => {
      const controller = makeForm()
      useLayoutEffect(() => {
        expect(controller.f.age.disabled).toBe(false)
        controller.f.age.disabled = true
        expect(controller.f.age.disabled).toBe(true)
        expect(controller.rawState.fields.age.disabled).toBe(true)
      }, [])
    }
    ctxRender(<CodeRunner code={disabledSet}/>, {store})
  })
  it('Gets the field name', async () => {
    const getName = () => {
      const controller = makeForm()
      useLayoutEffect(() => {
        expect(controller.f.age.fieldName).toBe('age')
      }, [])
    }
    ctxRender(<CodeRunner code={getName}/>, {store})
  })
  it('Handles cancelled validation', async () => {
    const context = defaultContextValues()
    context.validators.beep = async (args) => {
      await context.client.netCall({url: '/validator/', method: 'post', signal: args.signal})
      return ['You should not get this message.']
    }
    const mockNetCall = jest.spyOn(context.client, 'netCall')
    const cancelValidation = () => {
      const controller = useForm('test', {endpoint: '#', fields: {email: {value: '', validators: [{name: 'beep'}]}}})
      useLayoutEffect(() => {
        controller.f.email.model = 'wat'
        controller.f.email.validate.flush()
        // Should still be mid-request at this point.
        controller.f.email.cancelValidation()
        expect(controller.rawState.fields.email.errors).toEqual([])
        expect(mockNetCall).toHaveBeenCalledWith({url: '/validator/', method: 'post', signal: expect.any(AbortSignal)})
      }, [])
    }
    ctxRender(<CodeRunner code={cancelValidation}/>, {store, context})
  })
  it('Resets to initial values', async () => {
    const initialValues = () => {
      const controller = makeForm()
      useLayoutEffect(() => {
        expect(controller.f.age.initialValue).toBe(20)
        controller.f.age.initialValue = 30
        expect(controller.f.age.model).toBe(20)
        controller.f.age.errors = ['Test.']
        expect(controller.f.age.errors).toEqual(['Test.'])
        controller.f.age.reset()
        expect(controller.f.age.errors).toEqual([])
        expect(controller.f.age.model).toEqual(30)
      }, [])
    }
    ctxRender(<CodeRunner code={initialValues}/>, {store})
  })
})
