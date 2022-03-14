import {Patcher} from './Patcher'

export type BoundPatchers<T> = {
  [AttrName in keyof T]: Patcher<T, AttrName>
}