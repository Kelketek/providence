import {RegistryRoot} from './RegistryRoot'


export interface ProvidenceRegistries {
  single: RegistryRoot<any, any>,
  list: RegistryRoot<any, any>,
  form: RegistryRoot<any, any>,
}