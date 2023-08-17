import {BaseController} from '../../types/BaseController'
import {AxiosError, Method} from 'axios'
import {BaseFormModule} from './BaseFormModule'
import {FormState} from './FormState'
import {BoundFielders} from './BoundFielders'
import {FieldSetOptions} from './FieldSetOptions'
import {FormErrorSet} from './FormErrorSet'

export interface FormController<T> extends BaseController<BaseFormModule<T>> {
  /**
   * Returns '`form`', the type of module this controller handles.
   */
  moduleType: 'form',
  /**
   * The endpoint property on the form module. This is a getter/setter, so you can update the endpoint.
   */
  endpoint: string,
  /**
   * The HTTP method used when submitting this form. Usually this is 'post' or 'put'. This is a getter/setter,
   * in case you need to update it for some reason.
   */
  method: Method,
  /**
   * Fielders.
   */
  f: BoundFielders<T>,
  /**
   * Returns whether the form is currently being submitted.
   */
  sending: boolean,
  /**
   * Returns true if the form has a field by a particular name.
   */
  hasField: (fieldName: string) => boolean,
  /**
   * Gets a particular setting on a specific field from the form module.
   * @param name The name of the field
   * @param settingName The name of the setting on the field.
   */
  getFieldSetting: <FieldName extends keyof T, SettingName extends keyof FormState<T>['fields'][FieldName]>(
    name: FieldName, settingName: SettingName,
  ) => FormState<T>['fields'][FieldName][SettingName],
  /**
   * Sets a particular setting on a specific field from the form module.
   *
   * @param name The name of the field
   * @param settingName The name of the setting on the field.
   * @param value The value to set.
   */
  setFieldSetting: <FieldName extends keyof T, SettingName extends keyof FormState<T>['fields'][FieldName]>(
    name: FieldName, settingName: SettingName, value: FormState<T>['fields'][FieldName][SettingName],
  ) => void,
  /**
   * Deletes fields from the form.
   * @param names Field names to remove.
   */
  delFields: (names: Array<keyof FormState<T>['fields']>) => void,
  /**
   * Adds fields to the form
   * @param fieldSpec FieldSetOptions with defined fields to add.
   */
  addFields: (fieldSpec: Partial<FieldSetOptions<T>>) => void,
  /**
   * Gets/sets which 'Step' the form is on. This is used to break up long forms into multi-step wizards.
   */
  step: number,
  /**
   * Form-level errors. These are errors returned by the server which do not apply to any specific field.
   * To get field-level errors, use the Fielders.
   */
  errors: string[],
  /**
   * Gets/sets The status code of the last failed submit request.
   */
  status: string,
  /**
   * Derives the data from the form for submission. Creates an instance of `T`, omitting fields that match their
   * `OmitIf` value.
   */
  data: T,
  /**
   * Submits the form, returning a promise from the submission. It is recommended to catch any errors from this
   * submission with the :js:attr:`x <FormController.handleError>` function.
   */
  submit: <K>() => Promise<K>
  /**
   * Sets the form's error state from a `FormErrorSet`.
   *
   * @param errorSet A FormErrorSet containing errors for this form.
   */
  setErrors: (errorSet: FormErrorSet) => void,
  /**
   * A provided helper function which handles most of the cleanup when there's an error from submitting a form.
   * Derives the errors, and adjusts the state to show them and move the form step to the first error in the set.
   * Use this as the error handler for the :js:attr:`x <FormController.submit>` function, like so:
   *
   *  .. code-block:: typescript
   *
   *     controller.submit().then(yourSuccessFunction, controller.handleError)
   *
   * @param error An AxiosError raised when submitting the form.
   */
  handleError: (error: AxiosError) => void,
  /**
   * Stops all validation currently in progress for form fields. Useful when you're about to set errors manually but
   * they might be overwritten by in-progress validation.
   */
  stopValidators: () => void,
  /**
   * Clears all error-related settings on the form and its fields.
   */
  clearErrors: () => void,
  /**
   * Resets the form to its default state-- including all fields at their initial values and clearing all errors.
   */
  reset: () => void,
}