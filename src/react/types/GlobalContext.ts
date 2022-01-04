import {GlobalOptions} from '../../base/types/GlobalOptions'
import {ProvidenceRegistries} from '../../base/registry/types/ProvidenceRegistries'

export interface GlobalContext {
  options: GlobalOptions,
  registries: ProvidenceRegistries,
}