.. Providence documentation master file, created by
   sphinx-quickstart on Mon Feb  7 15:11:21 2022.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

The Eye of Providence State Management Library
==============================================

Redux, Vuex, and similar tools are incredibly powerful and allow you to get very specific with your state management and how it's handled. However the advantages of these libraries come at a cost of significant boilerplate. Most apps are CRUD apps that deal with specific lists and objects at remote HTTP endpoints.

Providence is a more opinionated abstraction layer that works on top of these state management libraries with the aim to present interfaces designed to make state management easy in the most common cases. It makes it possible to create code that looks much like normal JavaScript but which performs commits/actions in the upstream state management library.

Best of all, Providence is written in TypeScript, allowing you to have confidence that the objects you're storing are internally consistent and match your expectations.

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