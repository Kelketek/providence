import {BaseController} from '../../types/BaseController'
import {BaseSingleModule} from './BaseSingleModule'
import {QueryParams} from '../../types/QueryParams'
import {FieldUpdate} from './FieldUpdate'
import {PatchersRoot} from './PatchersRoot'
import {PatcherState} from './PatcherState'
import {BoundPatchers} from './BoundPatchers'
import ErrorTracking from '../../types/ErrorTracking'
import {AxiosResponse} from 'axios'

export interface SingleController<T> extends BaseController<BaseSingleModule<T>> {
  /**
   * Returns `'single`', the type of module this controller handles.
   */
  moduleType: 'single',
  /**
   * The endpoint property on the single module. This is a getter/setter, so you can update the endpoint.
   */
  endpoint: string,
  /**
   * The data structure you're tracking in the single module. It can also be null if you've neither fetched nor preset
   * its value. This is a getter and setter, so you can entirely replace :js:attr:`x <SingleController.x>` if you like.
   *
   * Note that you should not mutate the attributes of x directly. Instead, if you need to change
   * :js:attr:`x <SingleController.x>`, use :js:attr:`updateX <SingleController.updateX>`,
   * :js:attr`setX <SingleController.setX>`, set the :js:attr:`x <SingleController.x>` setter directly, or use the
   * :ref:`module_types/singles:Patchers`.
   */
  x: T | null,
  /**
   * A proxy object that creates patchers for any property on the object. So, for instance, if you have a type:
   *
   *  .. code-block:: typescript
   *
   *     declare interface MyType {
   *       id: number,
   *       name: string,
   *       fun: boolean,
   *     }
   *
   *   Then this object will contain the keys `id`, `name`, and `fun`. Each of these attributes will be a
   *   :js:class:`Patcher` bound to its specific field.
   *
   */
  p: BoundPatchers<T>,
  /**
   * Completely replace :js:attr:`x <SingleController.x>`.
   */
  setX: (val: T | null) => void,
  /**
   * Update the value of :js:attr:`x <SingleController.x>` in place by setting a subset of its values.
   */
  updateX: (val: Partial<T>) => void,
  /**
   * Fetch this object from its endpoint. No matter how many times this function is called, it only runs once, allowing
   * you to call it in any component that may need the function and not worry about several requests being sent.
   */
  getOnce: () => void,
  /**
   * Performs a get request. Will update the value of :js:attr:`x <SingleController.x>` based on what it retrieves, and return a promise
   * containing the new value.
   */
  get: () => Promise<T>,
  /**
   * Sends a patch request. Updates :js:attr:`x <SingleController.x>` with the value returned from the server, and returns a promise
   * containing the new value.
   */
  patch: (val: Partial<T>) => Promise<T>,
  /**
   * Sends a put request. Updates :js:attr:`x <SingleController.x>` with the value returned from the server, and returns a promise
   * containing the new value.
   */
  put: (val: Partial<T>) => Promise<T>,
  /**
   * Sends a post request. DOES NOT update :js:attr:`x <SingleController.x>` with the value returned from the server. Returns a promise
   * containing the value the server sent back.
   */
  post: <I, O = I>(val: I) => Promise<AxiosResponse<O>>,
  /**
   * Sends a deletion request to the server. If successful, marks :js:attr:`x <SingleController.x>` as null and sets
   * the :js:attr:`deleted <SingleController.deleted>` flag to `true` and sets the
   * :js:attr:`deleted <SingleController.deleted>` flag to `true`.
   */
  delete: () => Promise<void>,
  /**
   * Retrieves the stored error information from our last attempt at :js:attr:`getting <SingleController.get>` the
   * remote object.
   */
  errors: ErrorTracking,
  /**
   * Empties out the values in :js:attr:`errors <SingleController.errors>`.
   */
  resetErrors: () => void,
  /**
   * Set x and mark :js:attr`ready <SingleController.ready>` as `true`. Mostly useful for testing.
   */
  makeReady: (val: T) => void,
  /**
   * Initialize a patcher's settings. You might need this if the object returned from your initial fetching is
   * incomplete and does not have the field you want to add a patcher for, or if you need to initialize a patcher
   * without fetching the remote resource for some reason.
   */
  initializePatcherSettings: <AttrName extends keyof T>(
    attrName: AttrName,
  ) => void,
  /**
   * Set one of the patcher's settings. The single module keeps all the data for its patchers, rather than creating
   * a new module for each patcher.
   *
   * @private
   */
  setPatcherSetting: <AttrName extends keyof PatchersRoot<T>, Setting extends keyof PatcherState<T, AttrName>>(
    fieldUpdate: FieldUpdate<T, AttrName, Setting>,
  ) => void,
  /**
   * Get one of the patcher's settings. The single module keeps all the data for its patchers, rather than creating
   * a new module for each patcher.
   *
   * @private
   */
  getPatcherSetting: <AttrName extends keyof PatchersRoot<T>, Setting extends keyof PatcherState<T, AttrName>>(
    attrName: AttrName, setting: Setting,
  ) => PatcherState<T, AttrName>[Setting]

  /**
   * getter/setter to indicate that :js:attr:`x <SingleController.x>` is initialized and ready to be interacted with.
   * Mostly set internally, but can be explicitly set during testing.
   */
  ready: boolean,
  /**
   * getter/setter to indicate that :js:attr:`x <SingleController.x>` is being fetched via `get` request. Can be set
   * manually if needed for testing.
   */
  fetching: boolean,
  /**
   * getter/setter to indicate that the attempt to fetch :js:attr:`x <SingleController.x>` failed. Can be set
   * manually if needed for testing.
   */
  failed: boolean,
  /**
   * getter/setter to indicate whether the remote value we're tracking has been deleted.
   */
  deleted: boolean,
  /**
   * getter/setter for query parameters used when interacting with the endpoint.
   */
  params: QueryParams|null,
  /**
   * Custom JSON serializer to prevent infinite recursion.
   *
   * @private
   */
  toJSON: () => {
    controller: string,
    moduleType: 'single',
    x: T | null,
  }
}