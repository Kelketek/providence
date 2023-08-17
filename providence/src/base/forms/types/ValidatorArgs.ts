import {FormState} from './FormState'

/**
 * Validator functions are given a single context object argument with the following structure:
 */
export interface ValidatorArgs<FieldValueType, ArgsStruct, T> {
  /**
   * The `args` value will be whatever args are specified to the field upon initialization.
   *
   * For example, if the fields are specified in this way:
   *
   * .. code-block:: js
   *
   *     {
   *       password: {
   *         value: '',
   *         validators: [{name: 'length', args: {min: 5, max: 50}}]
   *       }
   *       password2: {
   *         value: '',
   *         validators: [{name: 'matches', args: {fieldName: 'password'}}],
   *       },
   *     }
   *
   * ...Then the `length` validator args for `password` will be `{min: 5, max: 50}` and the `matches` validator
   * args for `password2` will be `{fieldName: 'password'}`.
   */
  args: ArgsStruct,
  /**
   * An `AbortSignal <https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal>`_ connected to the current
   * validation attempt. This might be used if the field is updated and a new attempt will replace the current one,
   * or if the user submits the form before validation completes.
   *
   * Hand this signal to any network requests you perform to ensure that the request is appropriately aborted if the
   * validation attempt is aborted.
   */
  signal: AbortSignal,
  /**
   * The value of the field to be validated.
   */
  value: FieldValueType,
  /**
   * The name of the field to be validated.
   */
  fieldName: keyof T,
  /**
   * The current raw state of the form module in its entirety.
   */
  formState: FormState<T>
}