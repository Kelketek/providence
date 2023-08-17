import {SingleController} from './SingleController'
import {PatcherState} from './PatcherState'
import lodash from 'lodash'

/**
 * A wrapper class around individual attributes on a single.
 */
export interface Patcher<T, AttrName extends keyof T> {
  /**
   * Returns `'patcher`', the type of 'module' this wrapper handles. Technically patchers aren't modules,
   * since their state is shared with singles, however this makes it consistent with similarly behaving controllers,
   * which should have a `moduleType` property for easy identification.
   */
  moduleType: 'patcher'
  /**
   * The name of the field we're tracking on the single.
   */
  attrName: AttrName,
  /**
   * A reference to the SingleController, used for internal functions.
   */
  controller: SingleController<T>,
  /**
   * The most recently set value on the field through the patcher. Compared against the real value on the single x's
   * field to determine if the value is :js:attr`dirty`.
   */
  cached: null | T[AttrName],
  /**
   * A getter that returns `true` if the cached value does not match the value on the single's `x`.
   */
  dirty: boolean,
  /**
   * Whether a patch request is currently being sent. You might use this to determine whether a spinner should be shown.
   */
  patching: boolean,
  /**
   * Whether the underlying value has been loaded successfully (that is, is `x` set on the
   * :js:class:`SingleController`?)
   */
  loaded: boolean,
  /**
   * An array of derived errors from the server when trying to patch this field.
   */
  errors: string[],
  /**
   * A getter and setter that invokes the patch requesting machinery. That is, set this value to send a patch request.
   *
   * This value will return the :js:attr:`cached` value. Setting this value is equivalent to running :js:attr:`set`.
   */
  model: T[AttrName],
  /**
   * Gets the current value of the :js:attr`attrName` field on `x`.
   */
  rawValue: T[AttrName],
  /**
   * Sets a new value for the field, updating the :js:attr:`cache` and then running :js:attr:`debouncedSet`.
   */
  set: (val: T[AttrName]) => void,
  /**
   * The raw set function that :js:attr:`debouncedSet` debounces. You usually don't want to call this directly.
   * If you do, you'll probably want to set :js:attr:`cache` first. This function performs the actual patch request
   * and handles the resulting server response.
   */
  rawSet: (val: T[AttrName]) => void,
  /**
   * The debounced function that :js:attr:`set` calls. You usually don't want to call this directly.
   * If you do, you'll probably want to set :js:attr:`cache` first.
   */
  debouncedRawSet: lodash.DebouncedFunc<(val: T[AttrName]) => void>,
  /**
   * The `AbortController <https://developer.mozilla.org/en-US/docs/Web/API/AbortController>`_ used to abort patch
   * requests.
   *
   * @private
   */
  cancelController: AbortController,
  /**
   * Updates a setting for this patcher in the state manager.
   *
   * @private
   */
  setSetting: <Setting extends keyof PatcherState<T, AttrName>>(
    settingName: Setting, val: PatcherState<T, AttrName>[Setting],
  ) => void,
  /**
   * Retrieves a setting for this patcher in the state manager.
   *
   * @private
   */
  getSetting: <Setting extends keyof PatcherState<T, AttrName>>(
    settingName: Setting
  ) => PatcherState<T, AttrName>[Setting],
  /**
   * Custom JSON serializer to prevent infinite loops during serialization.
   *
   * @private
   */
  toJSON: () => {attrName: AttrName, controller: string, rawValue: T[AttrName], moduleType: 'patcher'}
}