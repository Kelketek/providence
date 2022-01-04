/*
When performing certain API calls, you may need query parameters set. These will be all stringified later, but can be
provided in any type. This might be worth revisiting.
 */
export interface QueryParams {
  [key: string]: number | string | null | boolean,
}