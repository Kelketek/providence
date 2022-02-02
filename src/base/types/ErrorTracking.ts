export default interface ErrorTracking {
  // We normalize error statuses to strings. The string could be something like 500 to indicate an internal
  // server error, or ECONNABORTED in the case of a network error. We use an empty string to indicate no error,
  // and UNKNOWN if the error isn't a standard network error, but bubbled up from somewhere else.
  status: string,
  messages: string[],
}