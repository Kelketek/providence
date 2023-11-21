import {SingleController} from '@opencraft/providence/base/singles/types/SingleController'
import {ReactNode, useMemo} from 'react'
import {useSingle} from '../hooks'

export const Single = <T,>({controller, children}: {controller: SingleController<T>, children: () => ReactNode}) => {
  useSingle<T>(controller.namespace, {endpoint: controller.endpoint})
  // eslint-disable-next-line
  const rendered = useMemo(children, [JSON.stringify(controller.rawState)])
  return <>{rendered}</>
}
