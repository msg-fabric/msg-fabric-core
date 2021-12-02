# MsgFabric Shared Timer & Timeouts

```javascript
hub.timeouts
hub.router.timeouts
hub.local.timeouts
pktctx.timeouts
```

### Methods

- timeouts is a function, same as `timeouts.add()`
- `add()`
- `race(ms_min_timeout, ... promises)`
- `interval(ms_opt, callback)`
- `hashbelt(ms_opt, max_length, create)`
- `ttl(ms_opt, query_ttl)`

- `ao_defer_v() : [promise, fn_resolve(), fn_reject()]`
  A deferred promise with external functions

- `ao_fence_v() : [fn_fence() : Promise, fn_resume(), fn_abort()]`
  A fence is a resetable deferred promise mechanism.

- `f_tick`, `f_empty` -- bound `ao_fence_v` for the timer queue
