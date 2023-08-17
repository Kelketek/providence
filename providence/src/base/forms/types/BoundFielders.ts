import {Fielder} from './Fielder'

export type BoundFielders<T> = {
  [AttrName in keyof T]: Fielder<T, AttrName>
}