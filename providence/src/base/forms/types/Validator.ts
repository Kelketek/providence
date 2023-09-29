import {ValidatorArgs} from './ValidatorArgs'

export type Validator<FieldValueType, ArgsStruct, T> = (args: ValidatorArgs<FieldValueType, ArgsStruct, T>) => Promise<string[]>