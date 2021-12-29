# `rpc` plugin for msg-fabric-core 

```javascript
let ep_my_api = hub.rpc.endpoint({
  // rpc methods
  m$_alpha(rpcx, ...args) { /* ... */ },
  m$_beta(rpcx, ...args) { /* ... */ },
  'another rpc method'(rpcx, ...args) { /* ... */ },
})
```

### `hub.rpc` and `hub.rpc_from(hub.localRoute(...))`

- RPC Client
  - `to(id, meta?, {...kw})` creates a directed RPC client to the `id`. `meta` and `kw` are optional.
  - `client` is a prototypal instace of rpc client with the target router

- `RPC` is the RPC API dispatcher strategy class
- `api` creates an instance of the RPC API dispatcher
- `stream(xtgt, rpc_api)`

- `endpoint(id_target?, rpc_api)`
- `ep_stateful(id_target?, rpc_api)`
- `ep_idempotent(id_target?, rpc_api)`

- `from()` and `hub.rpc_from()` -- binds a new RPC context using the specified target router.


### `rpc_api`

```javascript
hub.rpc.api({
  // rpc methods

  m$_alpha(rpcx, ...args) { /* ... */ },
  m$_beta(rpcx, ...args) { /* ... */ },
  'another rpc method'(rpcx, ...args) { /* ... */ },

  // optional override of rpc flow:

  rpc_lookup(rpc_call) {
    return this[rpc_call.method] },

  rpc_log(rpc_call, step, ...info) {
    console.log('rpc log [%o]', rpc_call.method, step, info) },

  rpc_dnu(rpc_call)`
    console.warn('rpc dnu [%o]', rpc_call.method) },

  rpc_error(err, rpc_call) {
    console.warn('rpc error [%o]', rpc_call.method, err) },
})
```

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

- Overridable on `rpc_api` as well as RPC
  - `rpc_lookup(rpc_call)` resolve method on `rpc_api` or undefined.
  - `rpc_log(rpc_call, step, ...info)`
  - `rpc_error(err, rpc_call)`
  - `rpc_dnu(rpc_call)`

- `bind_rpc(rpc_call, pktctx)`
  Given `rpc_call` of shape `['!', id_reply, method, ... args]`, resolve using `rpc_lookup`.
  Returns undefined if `rpc_call` or `method` name are invalid.


