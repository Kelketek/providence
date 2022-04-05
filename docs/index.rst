.. Providence documentation master file, created by
   sphinx-quickstart on Mon Feb  7 15:11:21 2022.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

The Eye of Providence State Management Library
==============================================

Redux, Vuex, and similar tools are incredibly powerful and allow you to get very specific with your state management and how it's handled. However the advantages of these libraries come at a cost of significant boilerplate. Most apps are CRUD apps that deal with specific lists and objects at remote HTTP endpoints.

Providence is a more opinionated abstraction layer that works on top of these state management libraries with the aim to present interfaces designed to make state management easy in the most common cases. It makes it possible to create code that looks much like normal JavaScript but which performs commits/actions in the upstream state management library.

Best of all, Providence is written in TypeScript, allowing you to have confidence that the objects you're storing are internally consistent and match your expectations.

Before Providence
=================

Providence can save you an enormous amount of time. To get an understanding of what providence is and what it automates, **we'll pretend we're building an application without it.** Here's our scenario:

You have a React application that has state you're sharing between many components. Sharing state around by passing arguments is cumbersome, and you're coming to the organizational limits of what you want contexts to handle. You do what's recommended in this situation, and install Redux.

The first thing you want to build in your redux store is the state for a new product page in your app. To build this, you'll need to establish the following:

1. The structure of the state in your redux store
2. The functions (thunks) that will handle fetching the product from your API, and any errors
3. A way to clear this store data when it's no longer needed.
4. A special set of functions to handle updating any fields on the product (we're assuming the user can edit it). These also will need their own error handling.
5. Reducers that scope all this data in a way your components can use.

Providence can handle all of this, but let's see what it would take just to handle point 1.

Your directory structure might look something like this:

.. code-block:: console

   tree product
   product
   ├── ProductPage.jsx
   └── data
       ├── api.js
       ├── selectors.js
       ├── slice.js
       └── thunks.js

In our `slice.js` file, we'll set up the state for our product.

.. code-block:: js

    import { createSlice } from '@reduxjs/toolkit'

    export const initialProductState = () => ({
      fetching: false,
      errors: [],
      product: null,
    });

    export const baseProductReducers = {
      fetchProductRequest(state) {
        state.fetching = true;
        state.errors = [];
        state.product = null;
      },
      fetchProductSuccess(state, { payload }) {
        state.fetching = false;
        state.product = payload.product;
      },
      fetchProductFailure(state, { payload }) {
        state.fetching = false;
        state.errors = payload.errors;
      },
      updateProduct(state, { payload }) {
        state.product = payload.value
      }
    };

    const slice = createSlice({
      name: 'product',
      initialState: initialProductState(),
      reducers: baseProductReducers,
    });

    export const productReducer = slice.reducer;
    export const productActions = slice.actions;

Next, we'll need to define a selector in `selectors.js.` Selectors are used to derive the important part of the state as it concerns to a particular component (as we'll set up later):

.. code-block:: js

    export const selectCourses = state => state.product;

Then, we'll want to write some API call functions that we can reuse as needed. Those will be in `api.js`

.. code-block:: js

    const baseUrl = 'https://example.com/';

    export const getProduct = async () => {
      // We'll assume a few utility functions exist here for API calls to the server.
      const client = getAuthenticatedHttpClient();
      const response = await client.get(`${baseUrl}/api/products/`);
      return response.data.results;
    }

    export const updateProduct = async(id, partialProduct) => {
      const client getAuthenticatedHttpClient();
      const response = await client.patch(`${baseUrl}/api/products/${id}/`, partialProduct);
      return response.data.results;
    }


OK. Now that we have our API functions, we need to create our 'thunks.' Thunks are special functions bound with a `dispatch` function that allows them to commit changes to the state.

.. code-block:: js

    import * as api from './api'
    import {catalogActions as actions} from "./slice";

    export const fetchProduct = () => async (dispatch) => {
      try {
        dispatch(actions.productFetchRequest());
        const product = await api.getProduct();
        dispatch(actions.fetchProductSuccess({product}))
      } catch (err) {
        dispatch(actions.fetchProductFailure({errors: [err + '']}))
      }
    }


That's a lot of boilerplate. In fact, it's only a fraction of what you'd need to build robust data handling. We didn't even touch updating the different attributes of the product-- this was just to load it and display it!

Worse, you'll need to build these files out for every structure you intend to store in Redux. This makes using Redux, and the guarantees it provides, incredibly verbose and arduous. What about with providence?

After Providence
================

With providence, all of the state management, error handling, and editing can be provided with a single line:

.. code-block:: js

    const controller = useSingle('product', {endpoint: 'https://example.com/api/products/x/'})


Providence allows you to instantiate fully functional modules in your data store, and gives you controller objects that make your life easy. Interested? :ref:`Click here to get started! <getting_started/index:Getting Started>`

History
-------

Providence is based on the initial state management code written by Fox Danger Piacenti at `Artconomy.com <https://artconomy.com/>`_. `OpenCraft <https://opencraft.com/>`_ has sponsored the lifting of this code out into this project.


.. toctree::
   :hidden:

   getting_started/index
   configuration
   concepts
   module_types/index
   interfaces