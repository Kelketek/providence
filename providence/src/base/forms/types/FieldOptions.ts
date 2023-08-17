import {ValidatorSpec} from './ValidatorSpec'

export interface FieldOptions<ValType> {
  /**
   * Indicates whether this field should be marked disabled. This does not affect providence's behavior,
   * but is useful when rendering fields in your desired component/template framework.
   */
  disabled?: boolean,
  /**
   * Validators used to check the data in this field. See the documentation on Validators for more information.
   */
  validators?: ValidatorSpec[],
  /**
   * The field's current value.
   */
  value: ValType,
  /**
   * The field's 'initial' value. In most cases this is taken from the `value` property, but it can be specified
   * manually if needed. Its function is to replace the current value when the form is reset.
   */
  initialValue?: ValType,
  /**
   * A list of errors this field has. These may come from the validators, or from a failed form submission.
   */
  errors?: string[],
  /**
   * To prevent the annoying artifact of checking a value before the user is finished typing, the debounce value for
   * the field may be set. This throttles how often the validators are run. Validators run after input has changed and
   * the number of milliseconds specified by this attribute have passed.
   */
  debounce?: number,
  /**
   * If the value equals this attribute, omit the field from the resulting data when constructing it for submission.
   * This can be used in cases where the presence of the key itself has significance, or when it could cause visual
   * artifacts. An example might be when constructing a query string for a search page-- if a searchable attribute isn't
   * specified, you probably don't want it in the URL!
   */
  omitIf?: any,
  /**
   * The 'step' this field is on. Forms can be constructed in wizard-like fashion, with several fields on one step, and
   * several steps in a form before submission. See the information on
   * :js:attr:`the form module's step attribute <FormModuleOptions.step>` for more information.
   */
  step?: number,
}