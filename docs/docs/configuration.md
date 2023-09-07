# Configuration

Providence's configuration options allow you to customize some of its automation. Each state management plugin comes with its own default settings for Providence that handle translating its functionality. Providence tries as much as possible to configure with sane defaults, but you will likely have to override at least a few settings, such as the :js:attr:`netCall <ProvidenceClient.netCall>` setting in the :js:class:`client <ProvidenceClient>`.

{%
    include-markdown "./reference/providence/interfaces/types_GlobalOptions.GlobalOptions.md"
    heading-offset=1
%}

{%
    include-markdown "./reference/providence/interfaces/types_Transformers.Transformers.md"
    heading-offset=1
%}

{%
    include-markdown "./reference/providence/interfaces/types_ProvidenceClient.ProvidenceClient.md"
    heading-offset=1
%}

{%
    include-markdown "./reference/providence/interfaces/types_Drivers.Drivers.md"
    heading-offset=1
%}
