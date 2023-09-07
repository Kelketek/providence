import ErrorTracking from '../../types/ErrorTracking'
import {FieldSetOptions} from './FieldSetOptions'

/**
 * The construction parameters are mostly state that the FormModule will be initialized with. This contains both the
 * values of the fields themselves and meta information about the form's status and how it is to be managed.
 */
export interface FormModuleOptions<T> {
  /**
   * The name of the module. Don't specify this-- it will be automatically supplied internally elsewhere.
   *
   * @private
   */
  name: string,
  /**
   * The endpoint this form is to be submitted to. Defaults to '#'.
   */
  endpoint?: string,
  /**
   * Key-value sets of fields of this form. See [FieldOptions](../interfaces/forms_types_FieldOptions.FieldOptions.md)
   * for the values.
   */
  fields: FieldSetOptions<T>,
  /**
   * Errors on the form itself, as opposed to the individual fields. Also contains the status of the last submission
   * attempt, normalized to a string, such as '500', 'UKNOWN' or 'ECONNABORTED'.
   */
  errors?: ErrorTracking,
  /**
   * Whether the form should be considered disabled. This does not affect providence's behavior but may be useful
   * when rendering in your favorite frontend template/component framework.
   */
  disabled?: boolean,
  /**
   * If true, this form will not be removed from the data store even when all listeners have been removed from it.
   */
  persistent?: boolean,
  /**
   * Forms may have 'steps' for wizard-like functionality. This keeps track of the current step of the form. When an
   * error is returned by the server, providence will roll the step back to the first step which contains a field with
   * an error. See [FieldOptions](../interfaces/forms_types_FieldOptions.FieldOptions.md) for setting the step of a
   * particular field.
   */
  step?: number,
}
