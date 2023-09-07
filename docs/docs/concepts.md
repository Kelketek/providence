Providence has several concepts for simplifying your state management.

## Modules

Providence automates the creation of pluggable modules for your preferred state manager. For example, in Redux it uses [Redux Dynamic Modules](https://redux-dynamic-modules.js.org/), and in Pinia, it uses its standard [dynamic module management features](https://pinia.vuejs.org/cookbook/migration-vuex.html#Dynamic-Modules). These modules have a combination of four definition sets:

* **state**: The initial state of the module handed to the state manager.
* **mutations**: Functions which modify the state atomically. These are passed the current state as well as (optionally) an argument that instructs how the state is to be modified. For instance, you might have an `increment` function which automatically increases `state.value` by 1, or you might have a `setValue` function that takes a number as an argument.
* **tasks**: Async functions that may call any number of mutations (or other tasks) during their run. These functions are handed bound `store` object that contains a `commit` function, for committing mutations, a `dispatch` function for calling tasks, and a `state` object representing the current state. Like mutations, they may also be handed an additional argument of the function author's choosing.

Modules are run through the `[Transformers.module](configuration#module)` function in order to reformat their contents in a manner the target state manager will understand. **In most cases, you should not interact with modules directly, but through their** `[Controllers](#controllers)`.

To see an example of a factory function which generates a module, check out [buildSingle](reference/providence/functions/singles.buildSingle.md).

## Controllers

Controllers are where the magic happens. They are objects that act as a proxy for all state management changes you may need. They allow you to treat changes to state (mostly) like normal TypeScript/JavaScript attributes and functions.

For instance, if a module has a `value` attribute on its state, you would need to implement a `setValue` mutation in order to change it. With the standard state management toolkits, this means taking the store and instructing it to commit 'setValue' for the particular module with a specified number. In some cases you completely forfeit type checking, and you have to remember what the name of the updating function is. It might look something like this:

```typescript
store.commit('moduleName/setValue', 5)
```

...But with a controller, you do:

```typescript
controller.value = 5
```

Much more idiomatic! The assignment will call `moduleName/setValue` in the background for you, keeping your logic free of the state manager's minutia.

Controllers have a `name` attribute used to uniquely identify them in their [Registry](concepts.md#registries). They have bound `commit` and `dispatch` functions that allow you to call their corresponding module mutations and tasks in a type-safe manner. However, in most cases, you won't need to call these directly. The getters, setters, and functions on a controller will call these for you.

The particular functions available in a controller depend on the module for which the controller was designed. See the relevant section (such as [Singles](module_types/singles.md)) for more information.

Controllers are always passed through the [Transformers.controller](configuration.md#controller) function, which should be provided by your state manager's plugin.

## Registries

Registries keep track of controllers and determine whether or not it is time to load or unload a module from the store. Since dynamically generating a module with a controller can be computationally expensive, and several components may specify the need for a particular module, we only ever want to create one of them no matter how many components ask-- at least until all components that were interested have unloaded.

Registries are mostly an internal concept and you should not need to interact with them directly (much like with [Modules](#modules), but they are useful to know about, as they help instrument much of the magic behind keeping track of controllers and ensuring sanity as far as your data store is concerned.
