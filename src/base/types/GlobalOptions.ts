/*
The PluginOptions object will inform the construction of the Singleton module. It contains things like a netCall
function. The netCall function (based loosely on Axios) is a function that will be called to do HTTP requests. It
should return a promise containing the
 */
import {NetCallOptions} from './NetCallOptions'
import {BaseModule} from './BaseModule'
import {BaseController} from './BaseController'
import {Patcher} from '../singles/types/Patcher'
import {AxiosError} from 'axios'
import {FormErrorSet} from '../forms/types/FormErrorSet'

export interface GlobalOptions {
  netCall<T, K = T>(opts: NetCallOptions<T>): Promise<K>,
  deriveErrors: <T>(val: AxiosError, knownFields: Array<keyof T>) => FormErrorSet,
  transformers: {
    module: <T extends BaseModule<any, any, any>>(module: T) => T,
    controller: <T extends BaseController<any>>(controller: T) => T,
    patcher: <T extends Patcher<any, any>>(patcher: T) => T,
  },
}