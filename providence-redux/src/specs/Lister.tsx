import {SingleController} from '@opencraft/providence/singles/types/SingleController'
import {ListModuleOptions} from '@opencraft/providence//lists/types/ListModuleOptions'
import {useList} from '../index'

export const Lister = <T,>({listName, listOpts}: {listName: string, listOpts: Omit<ListModuleOptions<T>, 'name'>}) => {
  const controller = useList<T>(listName, listOpts)
  return (
    <div>
      {controller.list.map((single: SingleController<T>) => (
        <div key={`${single.x![controller.keyProp]}`}>
          {JSON.stringify(single.x)}
        </div>
      ))}
    </div>
  )
}
