# MsgFabric Hub reference

```javascript
import MsgFabric from 'msg-fabric-core' 

const hub = MsgFabric.create(options)
```

### Options

- `id_route` -- route id for local target router; useful for tests and exploration.
- `id_prefix`, `id_suffix` -- configures `hub.newRouteId()` to allow hierarchial named route ids.
- `ms_interval=67` -- configures shared timer granularity. Defaults to 67, which is approximately 15 ticks per second.


### Properties

- `timeouts` -- returns shared timer from `hub.router.timeouts`. See [timeouts docs](./misc_timeouts.md)
- `router` -- returns `FabricRouter` instance. See [fabric router docs](./router_fabric.md)
- `local` -- default published `TargetRouter` instance. See `hub.localRoute()` and [router target docs](./router_targets.md)
- `loopback` -- alias for `hub.router.loopback`
- `send(...args)` -- alias for `loopback.send(...args)`


### Methods

- `randId()`
- `localRoute(id_route, is_private)` connects a new `TargetRouter`. See [router target docs](./router_targets.md)

- Connections and Channels
  - `connect(conn_url)` pluggable connection setup. See plugins for various implementations.
  - `connectUpstream(upstream_chan)` configures a channel as the default upstream for the fabric router.

- Plugin support
  - `livePlugin(... plugins)`
  - `plugin(... plugins)`

  - `registerProtocols(protocolList, cb_connect)` -- see [plugins/web](../plugins/web/index.jsy) and [plugins/net](../plugins/net/index.jsy)
  - `as_stream_codec()` and `bind_codec()` -- see [plugins/json](../plugins/json/json_codec.jsy) and [plugins/cbor](../plugins/cbor/cbor_codec.jsy)

