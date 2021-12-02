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

- `addTarget(id_target, target : function(pkt, pktctx), opt) : {`
- `hasTarget(id_target) : Boolean`
- `getTarget(id_target) : function(pkt, pktctx)`
- `removeTarget(id_target)` or `removeTarget({1: id_target})`

- `xstream(id_target, xapi)`
- `xtgt(id_target)` composed method for `xstream(id_target, router.xtgt_api)`
- `xresp(id_target)` composed method for `xstream(id_target, router.xresp_api)`

