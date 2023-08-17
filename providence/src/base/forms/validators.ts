/**
 * Example validators.
 *
 * Note that all validators are written as async functions. This is because they can rely on remote resources for
 * validation-- for example, determining if a username has already been taken. So, for a consistent API, even those
 * validators which require no async calls are written async.
 */
import {ValidatorArgs} from './types/ValidatorArgs'

export const email = async <T>({value} : ValidatorArgs<string, Record<string, unknown>, T>): Promise<string[]> => {
  if (value.trim() === '') {
    // Should be handled by the required validator instead.
    return []
  }
  const parts = value.split('@')
  if (parts.length !== 2) {
    return ['Emails must contain an @.']
  }
  const front = parts[0].trimLeft()
  const back = parts[1].trimRight()
  if (front.length === 0) {
    return ['You must include the username in front of the @.']
  }
  if (back.length === 0) {
    return ['You must include the domain name after the @.']
  }
  if (front.search(/\s/g) !== -1) {
    return ['Emails cannot have a space in the section before the @.']
  }
  if (back.search(/\s/g) !== -1) {
    return ['Emails cannot have a space in the domain name.']
  }
  if (back.indexOf('.') === -1) {
    return ['Emails without a full domain name are not supported. (Did you forget the suffix?)']
  }
  return []
}