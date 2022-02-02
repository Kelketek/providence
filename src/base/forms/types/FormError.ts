export type FormError<T> = {
  [Property in keyof T]: string[]
}
