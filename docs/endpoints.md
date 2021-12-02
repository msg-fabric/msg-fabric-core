# Message processing in MsgFabric

Message `pkt` are dispatched accompanied with the delivery `pktctx` for access to the source channel and routers.

Use `addStream()` to implement stateful or async serial message processing endpoints.

Use `addTarget()` to implement stateless or async independently parallel message processing endpoints.


### `pkt` message packets

`pkt` is a JSON-like object with that is transferred through structured clone algorithm, or using codecs like JSON or CBOR.

- `pkt[0]` is `id_router` string
- `pkt[1]` is `id_target` string
- `pkt.body` is the payload, and may be an `{}` object, `[]` list, or `""` string.
- `pkt.meta` is optional, and may be an `{}` object, `[]` list, or `""` string.

### `pktctx` message packet context

`pktctx` is a prototypal object extension of `hub.router.router_ctx`:

- `channel` is the source channel `pkt` arrived from
- `reply(...args)` is a fast-path `channel.send(...args)` to bypass generic routing overhead.
- `redispatch(pkt, pktctx)` is useful when routes are discovered while handling packet

Extending `router_ctx`:

- `send(...args)` -- alias for `loopback.send(...args)`
- `loopback` -- alias for `hub.router.loopback`
- `timeouts` -- returns shared timer. See [timeouts docs](./misc_timeouts.md)
- `local` is an alias for `hub.local`



### `addTarget()` event-based

An event based target implementation for parallel message packet processing.

Easiest to use when your target is stateless; for stateful endpoints see `addStream()`.

```javascript
// tgt_addr is [id_router, id_target]
let tgt_addr = hub.local.addTarget(
  id_target, // or null for an assigned random id
  (pkt, pktctx) => {
    // ... handle message pkt
  })
```


### `addStream()` async iterator stream

A stream-based target implementation for serial async message packet processing.

Easier stateful target implementation; for stateless endpoints see `addTarget()`.

```javascript
let xtgt_info = hub.local.addStream(
  id_target, // or null for an assigned random id
  async (xtgt) => {
    // xtgt_info === xtgt

    for await (let [pkt, pktctx] of xtgt.stream) {
      // ... handle message pkt
    }
  })

```

- `xtgt.id` is `[id_router, id_target]`
  - `xtgt[0]` is `id_router`
  - `xtgt[1]` is `id_target`
- `xtgt.stream` is an async iterable of `[pkt, pktctx]` messages
- `xtgt.abort()` aborts the async iterable message stream
- `xtgt.when_done : promise` is resolved when `async_target` callback completes or errors.


### `addReply()` promise-based

A resettable promise-based response channel mechanism.

```javascript
let xresp_info = hub.local.addReply()

hub.send(tgt_addr,
  { msg: 'hello readme example with reply',
    id_reply: reply.id
  })

let ans = await reply.response()
console.log('Received reply', ans) 
```

