import {GlobalOptions} from '../types/GlobalOptions'
import {FormState} from './types/FormState'
import {FieldSet} from './types/FieldSet'
import {FormModuleOptions} from './types/FormModuleOptions'
import {Field} from './types/Field'
import {BaseFormModule} from './types/BaseFormModule'
import {FormErrorSet} from './types/FormErrorSet'
import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'
import {BoundStore} from '../types/BoundStore'
import {ProvidenceSlicer} from '../types/ProvidenceSlicer'
import {Method} from 'axios'
import {FormController} from './types/FormController'
import {formControllerFactory} from './controller'


export const formDefaults = <T>(): Omit<FormState<T>, 'fields' | 'name'> => ({
  endpoint: '#',
  method: 'post',
  errors: {status: '', messages: []},
  disabled: false,
  persistent: false,
  sending: false,
  step: 1,
})

export const fieldDefaults = <FieldVal>(): Omit<Field<FieldVal>, 'value' | 'initialValue'> => ({
  disabled: false,
  validators: [],
  errors: [],
  debounce: 500,
  step: 1,
})

export function dataFromForm<T>(form: FormState<T>): T {
  const data: Partial<T> = {}
  for (const key of Object.keys(form.fields)) {
    const fieldName = key as string & keyof T
    if (form.fields[fieldName].omitIf !== undefined) {
      if (isEqual(form.fields[fieldName].value, form.fields[fieldName].omitIf)) {
        continue
      }
    }
    data[fieldName] = form.fields[fieldName].value
  }
  return data as T
}

const clearErrors = <T>(state: FormState<T>) => {
  state.errors.status = ''
  state.errors.messages = []
  for (const key of Object.keys(state.fields)) {
    state.fields[key as keyof T].errors = []
  }
}

export function buildForm<T>(globalOptions: GlobalOptions): (options: FormModuleOptions<T>) => BaseFormModule<T> {
  return (options: FormModuleOptions<T>) => {
    // An AbortController is not something which can be serialized and referred to later.
    // We keep it here in a closure for internal use.
    //
    // This does mean that the cancel functionality might 'break' in the case of a hot reload,
    // but in most cases this should be fine, as it only happens in development.
    const cancel = {controller: new AbortController()}
    const fields: FieldSet<T> = {} as FieldSet<T>
    for (const field of Object.keys(options.fields)) {
      const fieldKey = field as string & keyof T
      let initialValue: undefined | T[typeof fieldKey] = options.fields[fieldKey].initialValue
      if (initialValue === undefined) {
        initialValue = options.fields[fieldKey].value
      }
      fields[fieldKey] = {...fieldDefaults(), ...options.fields[fieldKey], initialValue: initialValue as T[typeof fieldKey]}
    }
    const initialState: FormState<T> = {...formDefaults(), ...options, fields}
    // Creates new state tracking information for a form.
    const module: BaseFormModule<T> = {
      state: initialState,
      mutations: {
        kill() {
          // This function doesn't mutate stored state, but also does not rely on any promises, so it's built as a
          // mutation to make more clear its immediate return contract.
          //
          // It does, however, mutate some internal state for the module since the abort controller needs to be
          // regenerated for each request.
          cancel.controller.abort()
          cancel.controller = new AbortController()
        },
        setErrors(state, errorSet: FormErrorSet) {
          // Sets the errors across an entire form. Fills in blanks for any missing fields.
          state.errors.messages = errorSet.messages
          state.errors.status = errorSet.status
          for (const key of Object.keys(state.fields)) {
            const fieldKey = key as keyof T
            state.fields[fieldKey].errors = cloneDeep<string[]|undefined>(errorSet.fields[fieldKey]) || []
          }
        },
        setEndpoint(state, endpoint: string) {
          state.endpoint = endpoint
        },
        setStep(state, step) {
          state.step = step
        },
        setSending(state, sending: boolean) {
          state.sending = sending
        },
        setMethod(state, method: Method) {
          state.method = method
        },
        clearErrors(state) {
          clearErrors(state)
        },
        setMetaErrors(state, errors) {
          // Sets the meta form errors, such as those for connection issues.
          state.errors = errors
        },
        updateField(state, update) {
          // Updates the data to contain whatever additional information is given.
          Object.assign(state.fields[update.name], update.settings)
        },
        addFields(state, fieldSpec) {
          // Adds one or more fields to the form, with default fallback settings the same as would have been
          // done if they had been added on initialization.
          for (const key of Object.keys(fieldSpec)) {
            const fieldKey = key as string & keyof T & keyof typeof fieldSpec
            /* eslint-disable @typescript-eslint/no-non-null-assertion */
            let initialValue: undefined | T[typeof fieldKey] = fieldSpec[fieldKey]!.initialValue
            /* eslint-enable @typescript-eslint/no-non-null-assertion */
            if (initialValue === undefined) {
              initialValue = options.fields[fieldKey].value
            }
            state.fields[fieldKey] = {
              ...fieldDefaults(),
              ...fieldSpec[fieldKey],
              initialValue: initialValue as T[typeof fieldKey],
            }
          }
        },
        delFields(state, fields) {
          // Deletes a field from a form.
          for (const fieldName of fields) {
            delete state.fields[fieldName]
          }
        },
        resetForm(state) {
          for (const key of Object.keys(state.fields)) {
            const fieldName = key as string & keyof T
            state.fields[fieldName].value = state.fields[fieldName].initialValue
          }
          clearErrors(state)
          state.step = 1
        },
        resetFields(state, fields) {
          for (const fieldName of fields) {
            state.fields[fieldName].errors = []
            state.fields[fieldName].value = state.fields[fieldName].initialValue
          }
        }
      },
      tasks: {
        async submit<K = T>({state, commit}: BoundStore<BaseFormModule<T>>): Promise<K> {
          const data = dataFromForm<T>(state)
          commit('setSending', true)
          commit('clearErrors')
          return globalOptions.client.netCall<Partial<T>, K>({url: state.endpoint, method: 'post', data, signal: cancel.controller.signal}).then((response) => {
            commit('setSending', false)
            return globalOptions.client.deriveForm<T, K>({state, response}) as K
          })
        },
      }
    }
    return globalOptions.transformers.module(module)
  }
}

export const FormModule: ProvidenceSlicer<'form', FormModuleOptions<any>, BaseFormModule<any>, FormController<any>> = {
  name: 'form',
  factory: buildForm,
  controllerFactory: formControllerFactory,
}
