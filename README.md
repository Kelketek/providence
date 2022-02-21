# Providence

This is the Eye of Providence state abstraction library. It aims to make state management with tools like Redux and Vuex much easier.

## Philosophy

Redux, Vuex, and similar tools are incredibly powerful and allow you to get very specific with your state management and how it's handled. However the advantages of these libraries come at a cost of significant boilerplate. Most apps are CRUD apps that deal with specific lists and objects at remote HTTP endpoints.

Providence is a more opinionated abstraction layer that works on top of these state management libraries with the aim to present interfaces designed to make state management easy in the most common cases. It makes it possible to create code that looks much like normal JavaScript but which performs commits/actions in the upstream state management library.

Best of all, Providence is written in typescript, allowing you to have confidence that the objects you're storing are internally consistent and match your expectations.

## History

Providence is based on the initial state management code written by Fox Danger Piacenti at [Artconomy.com](https://artconomy.com/). [OpenCraft](https://opencraft.com/) has sponsored the lifting of this code out into a state management library that can be consumed by the general public.

## Documentation

[Full documentation is available on ReadTheDocs](https://eye-of-providence.readthedocs.io/en/latest/).