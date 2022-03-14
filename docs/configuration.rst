Configuration
=============

Providence's configuration options allow you to customize some of its automation. Each state management plugin comes with its own default settings for Providence that handle translating its functionality. In most cases, you'll not want to change anything more than the :js:attr:`netCall <GlobalOptions.netCall>` option. However, you can extend Providence's controllers, or even implement support for your favorite state management backend if the included ones don't hande your needs.

.. js:autoclass:: GlobalOptions
    :members:

.. js:autoclass:: Transformers
    :members:

.. js:autoclass:: ProvidenceClient
    :members:

.. js:autoclass:: Drivers
    :members: