/**
 * A wrapper class around individual fields on a form. Called 'fielder' because they are most analogous to Patchers
 * in the Single module, but
 */
import debounce from 'lodash.debounce'
import {FormState} from './FormState'
import {FormController} from './FormController'

export interface Fielder<T, FieldName extends keyof T> {
  /**
   * Returns `'fielder`', the type of 'module' this wrapper handles. Technically fielders aren't modules,
   * since their state is shared with singles, however this makes it consistent with similarly behaving controllers,
   * which should have a `moduleType` property for easy identification.
   */
  moduleType: 'fielder',
  /**
   * Grabs a specified attribute from a field's settings, such as its 'value' or its 'validators' array.
   */
  attr: <AttrName extends keyof FormState<T>['fields'][FieldName] & string>(attrName: AttrName) => FormState<T>['fields'][FieldName][AttrName]
  /**
   * Gets/sets the raw value of the field. Unlike `model`, this does not trigger validation checks.
   */
  rawValue: T[FieldName],
  /**
   * Returns the name of the field
   */
  fieldName: FieldName,
  /**
   * Gets/sets the raw value of the field, triggering validation checks.
   */
  model: T[FieldName],
  /**
   * Returns a flag which indicates if the field should be considered disabled.
   */
  disabled: boolean,
  /**
   * Gets/sets the errors on a field.
   */
  errors: FormState<T>['fields'][FieldName]['errors'],
  /**
   * Gets/sets the form step this field is on.
   */
  step: FormState<T>['fields'][FieldName]['step'],
  /**
   * Gets/sets the initial Value for this field. This is what is used to populate the field when the form is reset.
   */
  initialValue: T[FieldName],
  /**
   * Returns the debounce rate set on the field.
   */
  debounce: FormState<T>['fields'][FieldName]['debounce'],
  /**
   * Runs the validators on the form. Usually you don't want to call this directly-- instead, try the debounced
   * validate() function.
   */
  runValidators: () => void
  /**
   * Debounced call to runValidators. Especially helpful to avoid annoying users that are still typing.
   */
  validate: ReturnType<typeof debounce>
  /**
   * Force cancel current validation run. We use this when submitting a form so our validators don't clobber whatever
   * the server sends back.
   */
  cancelValidation: () => void,
  /**
   * Resets this field to its initial value and clears errors.
   */
  reset: () => void,
  /**
   * Returns the FormController.
   */
  controller: FormController<T>,
  /**
   * Custom JSON serializer to prevent infinite loops during serialization.
   *
   * @private
   */
  toJSON: () => {fieldName: FieldName, controller: string, value: T[FieldName], moduleType: 'fielder'}
}