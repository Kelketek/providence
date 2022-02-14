/**
 * When performing certain API calls, you may need query parameters set. These will be all
 * stringified later, but can be provided in any type. This might be worth revisiting. At the moment this
 * doesn't support multiple entries for a name in a query string.
 *
 * Keys can be any string, while value is a `number`, `string`, `null`, or `boolean`.
 */
export interface QueryParams {
  [key: string]: number | string | null | boolean,
}