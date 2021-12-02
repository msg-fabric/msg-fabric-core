# MsgFabric Fabric Router reference

```javascript
hub.router
```

### Properties

- `timeouts` -- returns shared timer. See [timeouts docs](./misc_timeouts.md)
- `loopback` -- MessagePort based local channel. See [code/channel.jsy](../code/channel.jsy)
- `router_ctx` -- Shared context for target packets. Extensible by plugins.
- `xresp_api` and `xtgt_api` -- extend `router_ctx` with APIs for implementing endpoint targets


### Methods

- `addDynamic(id_route, route : function, opt) : [route, bound removeRoute]` alias for `addPeer()` or `addRoute()` depending on `route` argument.
- `addPeer(id_route, channel, opt) : [route, bound removeRoute]` composed `addRoute()`

- `addRoute(id_route, route : function, opt) : {route : function, cancel: bound removeRoute}`
- `removeRoute(id_route) : Boolean` or `removeRoute({id_route}) : Boolean`
- `hasRoute(id_route) : Boolean`
- `getRoute(id_route) : route function`

- `dispatch(pkt, channel) : Promise`
- `resolveRoute(id_route, allowDiscover, allowUpstream) : route function`

- `publishRoute(route)`
- `setUpstream(upstream, opt)`
- `discoverRoute()` -- see [plugins/discover](../plugins/discover/index.jsy)
- `ref()` and `unref()`

