import {SingleModuleOptions} from '@opencraft/providence/base/singles/types/SingleModuleOptions'
import {useSingle} from '../hooks'

export const Singler = <T,>({singleName, singleOpts}: {singleName: string, singleOpts: Omit<SingleModuleOptions<T>, 'name'>}) => {
  const controller = useSingle<T>(singleName, singleOpts)
  return (
    <div>
      {JSON.stringify(controller.x)}
    </div>
  )
}
