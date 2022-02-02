import {ProvidenceSlicer} from './ProvidenceSlicer'
import {ProvidenceRegistries} from '../registry/types/ProvidenceRegistries'

export type AnySlicer = ProvidenceSlicer<keyof ProvidenceRegistries, any, any, any>
