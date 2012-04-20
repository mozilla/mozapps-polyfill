mozapps-polyfill
================

[Mozilla Open Web
Applications](https://developer.mozilla.org/en/OpenWebApps) provide a
`navigator.mozApps` API ([documented
here](https://developer.mozilla.org/en/Apps/Apps_JavaScript_API)).

This API is provided Natively in Firefox 14+, but this polyfill offers the
basic features of the API in earlier versions and other browsers.

The libraries here are published at https://apps.persona.org and they should
be used only at that domain (except for testing and development of course). 
You should include:

    <script src="https://apps.persona.org/jsapi/include.js"></script>

in your page.  If the browser already natively supports `navigator.mozApps`
this include will do nothing, but if not it will patch in this support.

