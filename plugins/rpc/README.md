# `rpc` plugin for msg-fabric-core 


### `hub.rpc` and `hub.rpc_from(hub.localRoute(...))`

- RPC Client
  - `to(id, meta?, {...kw})` creates a directed RPC client to the `id`. `meta` and `kw` are optional.
  - `client` is a prototypal instace of rpc client with the target router

- `RPC` is the RPC API dispatcher strategy class
- `rpc_api` creates an instance of the RPC API dispatcher

- `endpoint(id_target?, rpc_api)` creates a streaming

- `from()` and `hub.rpc_from()` -- binds a new RPC context using the specified target router.

### `rpc_client`

- `.rpc_post(method, ...args)`
- `.post.m$_method(...args)`

- `.rpc_query(method, ...args)`
- `.query.m$_method(...args)`

- `.to(id, meta, {... kw}?)`
- `.with({...kw})`


### `RPC` dispatch

- `static create(rpc_api)`
- `new RPC(rpc_api)` constrcutor
- `async rpc_stream(xtgt)`
- `async rpc_pkt(pkt, pktctx)`

- `rpc_dnu(rpc_api, method, pktctx)`
  Override to customize logging for fallback `__dnu__()` handling

- `bind_rpc(rpc_call, pktctx)`
  Given `rpc_call` of shape `['!', id_reply, method, ... args]`, resolve method on `rpc_api` or as a bound DNU method.
  Returns undefined if `rpc_call` or `method` name are invalid.

  Parts of composed implementation of `bind_rpc`

  - `lookup_name(method, pktctx)` resolve method on `rpc_api` or undefined.
  - `_bind_rpc()` 
  - `_bind_reply()`
  - `_bind_dnu()`

