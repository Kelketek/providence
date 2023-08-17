export interface PatcherState<T, PropName extends keyof T> {
  cached: null | T[PropName],
  errors: string[],
  dirty: boolean,
  patching: boolean,
}