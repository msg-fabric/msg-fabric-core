# MsgFabric Targets Router reference

```javascript
hub.local
```

### Properties

- `ready : Promise`
- `timeouts` -- returns shared timer. See [timeouts docs](./misc_timeouts.md)
- `loopback` -- alias for `hub.router.loopback`
- `send` -- alias for `loopback.send`


### Methods

- `addReply(opt)` composed method for `.xresp().with(opt)
- `addStream(id_target, fn_async_target, on_error=this._on_stream_error)`
    composed method for `fn_async_target(xtgt(id_target)).catch(on_error)`
- `removeAfter(id, p_done : Promise) : Promise`
    awaits `p_done` then invokes `.removeTarget(id_target)

- `randId()`
- `newTargetId()`
- `discoverTarget(id_target, pktctx)`

- `addTarget(id_target, target : function(pkt, pktctx), opt) : [id_route, id_target]`
- `hasTarget(id_target) : Boolean`
- `getTarget(id_target) : function(pkt, pktctx)`
- `removeTarget(id_target)` or `removeTarget({1: id_target})`

- `addDefer_v(target, inc_pktctx, dp=ao_defer_v()) : {id:[id_route, id_target], promise}`
  Uses a `ao_defer_v()` to construct a self-removing one message target endpoint.
  The optional `target` function is inserted in the returned promise.
  Returns the target id and deferred promise.

- `addOnce(ms, absent, target = pkt => pkt.body) : {id:[id_route, id_target], promise}`
  Uses `addDefer_v()` and `timeouts.absent()` to construct an auto-expiring target endpoint.
  Returns the target id and deferred promise.

- `xstream(id_target, xapi)`
- `xtgt(id_target)` composed method for `xstream(id_target, router.xtgt_api)`
- `xresp(id_target)` composed method for `xstream(id_target, router.xresp_api)`

