import {RegistryRoot} from '../types/RegistryRoot'
import {removeFromRegistry} from '../registry'

const mockWarn = jest.spyOn(console, 'warn')

describe('removeFromRegistry', () => {
  let registry: RegistryRoot<any, any>
  beforeEach(() => {
    registry = {single: {children: {}, listeners: [], controller: {name: 'Thing'}}}
    mockWarn.mockReset()
  })
  it('Complains of non-existent entries', () => {
    removeFromRegistry(registry, ['single', 'test'])
    expect(console.warn).toHaveBeenCalledWith('Tried to remove non-existent registry entry, ["single","test"]. Ignoring.')
  })
  it('Throws if listeners remain', () => {
    registry.single.children.test = {listeners: ['wat'], children: {}}
    expect(() => removeFromRegistry(registry, ['single', 'test'])).toThrow(
      Error(`Cannot remove an entry that still has listening components! Tried to remove ["single","test"], listeners were ["wat"]`),
    )
  })
  it('Does not entirely destroy an entry if it has children', () => {
    registry.single.children.test = {listeners: ['wat'], children: {}}
    removeFromRegistry(registry, ['single'])
    expect(registry).toEqual({single: {listeners: [], children: {test: {listeners: ['wat'], children: {}}}}})
  })
})