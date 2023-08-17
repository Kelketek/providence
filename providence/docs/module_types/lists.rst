Lists
-------

Lists are groups of :ref:`Singles <module_types/singles:Singles>` with scaffolding for pagination and manipulation around them. You might use a list to track a user's notifications, their friends, their favorites, or anything else you can convince your API to give you an array of.


List Controllers
==================

Instantiating a :ref:`list controller <module_types/lists:Controller Reference>` (and, thus, creating a list module) is similar to doing so for a single controller.

To get a new list controller:

.. tabbed:: React/Redux

   .. dropdown:: TypeScript
      :open:

      .. code-block:: jsx

         import {useList} from '@opencraft/providence/react/hooks'

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
           return <div>{controller.list.map(singleController) => <div>{singleController.x}</div>}</div>
         }

   .. dropdown:: JavaScript

     .. code-block:: jsx

        import {useSingle} from '@opencraft/providence/react/hooks'

        const MyComponent = () => {
          controller = useSingle('currentItem', {endpoint: 'https://example.com/api/endpoint/'})
           useEffect(() => {
             // Like with single controllers, firstRun will fetch the initial array.
             controller.firstRun()
           })
          return <div>{controller.list.map(singleController) => <div>{singleController.x}</div>}</div>
        }

.. tabbed:: Vue/Vuex

   .. dropdown:: TypeScript
      :open:

      .. code-block:: typescript

         // Coming once the Vuex module is completed.

   .. dropdown:: JavaScript

      .. code-block:: javascript

         // Coming once the Vuex module is completed.


List Module Options
#####################

In most cases, you'll only need to hand the `retrieval function <List Controllers>`_ the :js:attr:`endpoint <SingleModuleOptions.endpoint>` of the object you're retrieving, but you may also need to set a number of other attributes, such as the `paginated` flag, which is true by default.

.. js:autoclass:: ListModuleOptions
   :members:


Controller Reference
####################

.. js:autoclass:: ListController
   :members:
