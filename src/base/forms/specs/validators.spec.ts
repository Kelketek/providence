import {email} from '../validators'
import {fieldDefaults, formDefaults} from '../index'

describe('Email validator', () => {
  it.each`
    value                  | result
    ${''}                  | ${[]}
    ${'test@example.com'}  | ${[]}
    ${'test'}              | ${['Emails must contain an @.']}
    ${'@'}                 | ${['You must include the username in front of the @.']}
    ${'@stuff'}            | ${['You must include the username in front of the @.']}
    ${'test@'}             | ${['You must include the domain name after the @.']}
    ${'test @example.com'} | ${['Emails cannot have a space in the section before the @.']}
    ${'test@ example.com'} | ${['Emails cannot have a space in the domain name.']}
    ${'test@example'}      | ${['Emails without a full domain name are not supported. (Did you forget the suffix?)']}
  `('should return $result when handed the email $value.', async({value, result}) => {
    const output = await email({
      value,
      signal: new AbortController().signal,
      args: {},
      fieldName: 'email',
      formState: {
        name: 'test',
        ...formDefaults(),
        fields: {
          email: {...fieldDefaults(), value: '', initialValue: ''},
        }
    }})
    expect(output).toEqual(result)
  })
})