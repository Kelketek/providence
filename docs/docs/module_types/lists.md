Lists are groups of [Singles](singles.md) with scaffolding for pagination and manipulation around them. You might use a list to track a user's notifications, their friends, their favorites, or anything else you can convince your API to give you an array of.


## List Controllers

Instantiating a [list controller](#list-controllers) (and, thus, creating a list module) is similar to doing so for a single controller.

To get a new list controller:

=== "React/Redux"

    === "TypeScript"
        ```typescript
        import {useList} from '@opencraft/providence-redux/hooks'
        import {Single} from '@opencraft/providence-redux/components/Single'
        
        // Declare a type in TypeScript to get typechecking for your single's data structure.
        declare interface MyStructureType {
          id: number,
          name: string,
        }
        
        const MyComponent = () => {
          controller = useList<MyStructureType>('currentItem', {endpoint: 'https://example.com/api/endpoint/'})
          useEffect(() => {
           // Like with single controllers, firstRun will fetch the initial array.
           controller.firstRun()
          })
          return (
            <div>
              {
                controller.list.map(singleController) => (
                  // The 'Single' React component makes sure we rerender anything 
                  // underneath it when the Single's state changes. We must specify
                  // this for singles created by lists if we are doing anything which
                  // isn't read-only with them.
                  <Single controller={singleController}>
                    {() => (
                      // Note that the child of the Single component is a function. 
                      // This is important-- otherwise the Single component won't be
                      // able to decide when to rerender-- its parent will, and it
                      // will be wrong.
                      <div>{singleController.x}</div>
                    )}
                  </Single>
                )
              }
            </div>
          )
        ```

    === "JavaScript"

        ```javascript
        import {useSingle} from '@opencraft/providence-redux/hooks'

        const MyComponent = () => {
          controller = useSingle('currentItem', {endpoint: 'https://example.com/api/endpoint/'})
           useEffect(() => {
             // Like with single controllers, firstRun will fetch the initial array.
             controller.firstRun()
           })
          return (
            <div>
              {
                controller.list.map(singleController) => (
                  // The 'Single' React component makes sure we rerender anything 
                  // underneath it when the Single's state changes. We must specify
                  // this for singles created by lists if we are doing anything which
                  // isn't read-only with them.
                  <Single controller={singleController}>
                    {() => (
                      // Note that the child of the Single component is a function. 
                      // This is important-- otherwise the Single component won't be
                      // able to decide when to rerender-- its parent will, and it
                      // will be wrong.
                      <div>{singleController.x}</div>
                    )}
                  </Single>
                )
              }
            </div>
          )
        }
        ```

=== "Vue/Pinia"

    === "TypeScript"
        ```typescript
        // Coming once the Pinia module is completed.
        ```
    === "JavaScript"
        ```javascript
        // Coming once the Pinia module is completed.
        ```


## List Module Options

In most cases, you'll only need to hand the [retrieval function](#list-controllers) the [endpoint](../reference/providence/interfaces/lists_types_ListModuleOptions.ListModuleOptions.md#endpoint)` of the list you're retrieving, but you may also need to set a number of other attributes, such as the `paginated` flag, which is true by default.

[Check the full reference for the list module options here.](../reference/providence/interfaces/lists_types_ListModuleOptions.ListModuleOptions.md)


## Controller Reference

[Check the full reference documentation for the List Controller here.](../reference/providence/interfaces/lists_types_ListController.ListController.md)
