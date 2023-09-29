React/Redux
===========

!!! note
    Basic familiarity with [Redux][Redux], [React][React], and [React Hooks][React Hooks] are not covered in this overview. If you want an example project with all of these set up and configured, check out our [Demo Repository][Demo Repository].

Providence uses [Redux Dynamic Modules][Redux Dynamic Modules] and [Redux Toolkit][Redux Toolkit] to generate its slices. Installing Redux Toolkit in your project is recommended if you intend to add your own custom Redux slices. Redux and Redux Dynamic Modules, however, are required. For the purposes of this tutorial, we'll also use react-dom, which you will almost certainly use in production as well, and axios:

```console
npm i -s redux-dynamic-modules react-dom axios react-redux \
         react @reduxjs/toolkit @opencraft/providence-redux \
         @opencraft/providence
npm i -sD @types/react @types/react-dom @types/redux-dynamic-modules
```

Now that we have our prerequisites, let's set up a very basic project:

=== "TypeScript"
    ```typescript
    import ReactDOM from 'react-dom'
    import axios, {AxiosResponse} from 'axios'
    import {Provider} from 'react-redux'
    import {createStore, IModuleStore} from 'redux-dynamic-modules'
    import {ProvidenceContext, defaultContextValues} from '@opencraft/providence-redux/context'
    import {NetCallOptions} from '@opencraft/providence/base/types/NetCallOptions'
    import {DeriveSingleArgs} from '@opencraft/providence/base/types/DeriveSingleArgs'

    // To begin using Providence, we need to initialize a dynamic module store:
    const store: IModuleStore<{}> = createStore({})

    // The Providence redux plugin should give you sane defaults. In many cases, the only thing you need to override
    // are the client functions.
    const buildContext = {...defaultContextValues()}

    buildContext.client.netCall = <T, K = T>(options: NetCallOptions<T>): Promise<AxiosResponse<K>> => {
      // You'll want to add whatever other Axios configuration arguments you need for your API here. That will likely
      // include things like Authorization headers. Read the Axios documentation for more information.
      return axios.request(options)
    }
    buildContext.client.deriveSingle = ({response}: DeriveSingleArgs) => {
      // The test API we'll be using has a 'data' attribute within the JSON data which contains the real data.
      return response.data.data
    }
    const ExampleComponent = () => <div />

    ReactDOM.render(
      <Provider store={store}>
        <ProvidenceContext.Provider value={buildContext}>
          <ExampleComponent />
        </ProvidenceContext.Provider>
      </Provider>,
      // For this example, we're assuming this code will run in an HTML document with a div with an id of 'root'.
      document.getElementById('root'),
    );
    ```

=== "JavaScript"

    ```javascript
    import ReactDOM from 'react-dom'
    import axios, {AxiosResponse} from 'axios'
    import {Provider} from 'react-redux'
    import {createStore} from 'redux-dynamic-modules'
    import {ProvidenceContext, defaultContextValues} from '@opencraft/providence-redux/context'
    import {NetCallOptions} from '@opencraft/providence/base/types/NetCallOptions'
    
    // To begin using Providence, we need to initialize a dynamic module store:
    const store = createStore({})
    
    // The Providence redux plugin should give you sane defaults. In many cases, the only thing you need to override
    // are the client functions.
    const buildContext = {...defaultContextValues()}
    
    buildContext.client.netCall = (options) => {
      // You'll want to add whatever other Axios configuration arguments you need for your API here. That will likely
      // include things like Authorization headers. Read the Axios documentation for more information.
      return axios.request(options)
    }
    buildContext.client.deriveSingle = ({request}) => {
      // The test API we'll be using has a 'data' attribute within the JSON data which contains the real data.
      return response.data.data
    }
    const ExampleComponent = () => <div />
    
    ReactDOM.render(
      <Provider store={store}>
       <ProvidenceContext.Provider value={buildContext}>
         <ExampleComponent />
       </ProvidenceContext.Provider>
      </Provider>,
      // For this example, we're assuming this code will run in an HTML document with a div with an id of 'root'.
      document.getElementById('root'),
    );
    ```

Now that we have our environment configured, let's build out `ExampleComponent` into something useful.

=== "TypeScript"

    ```typescript
    import {useSingle} from '@opencraft/providence-redux/hooks'
    
    declare interface Product {
      id: number,
      name: string,
      year: number,
      color: string,
      pantone_value: string,
    }
    
    const ExampleComponent = () => {
    
      // Providence exposes controller creation/management through custom React hooks.
      const controller = useSingle<Product>('product', {endpoint: 'https://reqres.in/api/products/3'})
    
      // No need to use useEffect() with getOnce, since it only ever runs once per controller anyway.
      controller.getOnce()
    
      if (!controller.x) {
        return <div>Loading...</div>
      }
    
      const product = controller.x
      return (
        <div>
          <h1>{product.name}</h1>
          <div>Year: {product.year}</div>
          <button onClick={() => controller.patch({year: product.year + 1})}>Increase year</button>
        </div>
      )
    }
    ```

=== "JavaScript"

    ```javascript
    import {useSingle} from '@opencraft/providence-redux/hooks'
    
    const ExampleComponent = () => {
    
      // Providence exposes controller creation/management through custom React hooks.
      const controller = useSingle('product', {endpoint: 'https://reqres.in/api/products/3'})
    
      // No need to use useEffect() with getOnce, since it only ever runs once per controller anyway.
      controller.getOnce()
    
      if (!controller.x) {
        return <div>Loading...</div>
      }
    
      const product = controller.x
      return (
        <div>
          <h1>{product.name}</h1>
          <div>Year: {product.year}</div>
          <button onClick={() => controller.patch({year: product.year + 1})}>Increase year</button>
        </div>
      )
    }
    ```

Now our `ExampleComponent` grabs the product, renders it for us, and even provides a little button to bump the value of the year. When the value is verified by the server, it returns the result and updates our internal representation of the product automagically.

Now that you've seen the basics, learn more by diving into the [Concepts](../concepts.md), and then study the details of the [Singles](../module_types/singles.md) module for more practical information.

[Redux]: https://redux.js.org/
[React]: https://reactjs.org/
[React Hooks]: https://reactjs.org/docs/hooks-intro.html
[Demo Repository]: https://gitlab.com/opencraft/dev/providence-demo
[Redux Dynamic Modules]: https://redux-dynamic-modules.js.org/
[Redux Toolkit]: https://redux-toolkit.js.org/
