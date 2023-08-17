Configuration
=============

Providence's configuration options allow you to customize some of its automation. Each state management plugin comes with its own default settings for Providence that handle translating its functionality. Providence tries as much as possible to configure with sane defaults, but you will likely have to override at least a few settings, such as the :js:attr:`netCall <ProvidenceClient.netCall>` setting in the :js:class:`client <ProvidenceClient>`.

.. js:autoclass:: GlobalOptions
    :members:

.. js:autoclass:: Transformers
    :members:

.. js:autoclass:: ProvidenceClient
    :members:

.. js:autoclass:: Drivers
    :members: