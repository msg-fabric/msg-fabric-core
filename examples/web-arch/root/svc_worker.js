function u8_to_base64(u8) {
  let res='', len = u8.byteLength, _cc=String.fromCharCode;
  for (let i=0; i<len; i++) {
    res += _cc(u8[i]);}
  return btoa(res)}

const u8_to_base64url = /* #__PURE__ */ (()=>{
  let s = {'+':'-','/':'_','=':''};
  let m = c => s[c];
  let rx = /[+=\/]/g;
  return u8 => u8_to_base64(u8).replace(rx, m)
})();

function random_base64(n) {
  return u8_to_base64url(
    crypto.getRandomValues(new Uint8Array(n))) }
function web_ids_plugin() {
  return {pre(hub) {
    hub.randId = random_base64;} } }

/* #__PURE__ */ Array.from(Array(256),
  (_, v) => v.toString(2).padStart(8, '0'));

/* #__PURE__ */ Array.from(Array(256),
  (_, v) => v.toString(16).padStart(2, '0'));

function u8_to_utf8(u8) {
  return new TextDecoder('utf-8').decode(u8) }

'undefined' !== typeof crypto
    ? crypto.getRandomValues.bind(crypto)
    : import('node:crypto').then(m => m.randomFillSync);

const json_codec ={
  name: 'JSON'
, encode: (pkt) => JSON.stringify(pkt)
, decode: data => JSON.parse(
    'string' === typeof data ? data
      : u8_to_utf8(data)) };

function json_codec_plugin() {
  return hub => {
    hub._root_.as_stream_codec(json_codec);} }

function p2p_plugin() {
  return hub => {
    hub._root_.p2p = bind_basic_p2p(hub);} }


function bind_basic_p2p(hub) {
  const ts_2020 = 1577836800000;
  return {
    initForChannel(channel) {
      return Object.create(this,{
        channel:{value: channel}
      , router:{value: channel.router} } ) }

  , ms_timeout: 5000
  , async hello(ms_timeout=this.ms_timeout) {
      let { channel, router } = this;
      let xt = router.timeouts;
      let id_reply = hub.randId(6);
      let dp = router.timeouts.ao_defer_v();
      this[ '_m$_' + id_reply ] = dp[1];
      if (ms_timeout) {
        xt.add(ms_timeout, () => dp[1](null)); }

      let ival_cancel = xt.interval(
        {ms: 250, initial: true},
        () =>
          channel.send('', 'hello',{
            version: this.version, id_reply, ts: new Date} ) );

      let ans;
      try {ans = await dp[0];}
      finally {
        ival_cancel();
        delete this[ '_m$_' + id_reply ];}

      let { public_routes } = router;
      for (let id_route of Object(ans).routes || []) {
        // Keep local public routes local
        if (! public_routes.get(id_route)) {
          channel.addRoute(id_route, false); } }

      for (let fn of this._q) {
        dp[0].then(fn);}
      return ans}

  , peerRoute(pkt) {
      let {1: id_target, body} = pkt;
      let fn = this[ '_m$_' + id_target ];
      return fn ? fn.call(this, body) : null}

  , _m$_hello(body) {
      let {version, id_reply} = Object(body);
      if (this.version !== version) {return}
      if (! id_reply) {return}

      return this.channel.send('', id_reply,{
        ... this.info,
        version, ts: Date.now() - ts_2020,
        routes: Array.from(
          this.router.public_routes.keys()) } ) }

  , version: 'basic'

  , info: {}
  , with_info(info) {
      this.info = {... this.info, ...info};
      return this}

  , _q: []
  , on(...fn_args) {
      this._q = this._q.concat(fn_args);
      return this} } }

const {
  assign: o_assign,
  create: o_create,
  freeze: o_freeze,
  defineProperties: o_defprop,
} = Object;

const is_array = Array.isArray;

const is_func = fn =>
  'function' === typeof fn;

const as_func = fn => {
  if ('function' !== typeof fn) {
    throw new TypeError}
  return fn};

const p_res = v =>
  Promise.resolve(v);

const p_then = (fn, v) =>
  is_func(fn) && p_res(v).then(fn);

const _unref = o =>
  o.unref ? (o.unref(), o) : o;

const _ref = o =>
  o.ref ? (o.ref(), o) : o;

class DiscoFirst {
  constructor() {
    this._cache = new WeakMap();}

  async _disco_all(discovery_fns) {
    let q=[];
    for (let fn of discovery_fns) {
      q.push(this._disco_one(fn)); }

    for (let p of q) {
      await p;}

    this.answer(null);}

  async _disco_one(fn_disco) {
    try {
      let res = await fn_disco(this.query);
      if (res === undefined) {
        this.answer(res);} }
    catch (err) {
      this.host._on_error('discovery', err);} }


  async cached(host, discovery_fns, query) {
    let belt = this._cache.get(discovery_fns);
    if (! belt) {
      belt = host._disco_cache();
      this._cache.set(discovery_fns, belt);}

    let p, {key} = query;
    for (let cache of belt) {
      if (p = cache[key]) {
        return p} }

    belt[0][key] = p =
      this.search(
        host, discovery_fns, query);
    return p}

  async search(host, discovery_fns, query) {
    let [p_search, _resolve] = host.timeouts.ao_defer_v();
    Object.assign(query, {host, p_search, done: false});

    let self ={
      __proto__: this, host, query,
      answer(res) {
        query.done = true;
        if (true === res || ! res) {
          res = null; }// falsy and true is "already exists"
        _resolve(res);} };

    host._disco_timeout(self.answer);
    self._disco_all(discovery_fns);
    return p_search} }

function discovery_plugin(opt={}) {
  let disco_first = new DiscoFirst();

  let _lut_discover_fn ={
    'function': (accept, fn) => q => accept(q) ? fn(q) : void 0
  , 'string': (accept, fn) => q => q.key.startsWith(accept) ? fn(q) : void 0
  , 'object'(accept, fn) {
      as_func(accept.test); // regexp or similar
      return q => accept.test(q.key) ? fn(q) : void 0} };


  let _disco_ ={
    _disco_cache() {return this.timeouts.hashbelt(opt.ms_rotate || 15000)}
  , _disco_timeout(resolve) {return this.timeouts(opt.ms_timeout || 2000, resolve)}

  , addDiscovery(accept, fn_discover) {
      if (fn_discover) {
        accept = _lut_discover_fn[typeof accept](accept, fn_discover);}
      this.discovery = [... (this.discovery || []), as_func(accept)];} };


  return {
    subclass(Hub) {

      o_assign(Hub.FabricRouter.prototype, _disco_,{
        async discoverRoute(id_route, router_ctx) {
          let fns = this.discovery;
          if (fns) {
            let query ={key: id_route, id_route, kind: 'route', router_ctx};
            await disco_first.cached(this, fns, query);} } } );


      o_assign(Hub.TargetRouter.prototype, _disco_,{
        async discoverTarget(id_target, pktctx) {
          let fns = this.discovery;
          if (fns) {
            let query ={key: id_target, id_target, kind: 'target', pktctx};
            await disco_first.cached(this, fns, query);} } } ); } } }

function direct_plugin({p2p, hello}={}) {
  hello = hello || 'mc';

  let _direct_ ={
    connect(peer, channel_id) {
      return this.connectPair(peer, channel_id)[0]}

  , pair(peer, channel_id) {
      return Promise.all(
        this.connectPair(peer, channel_id)) }

  , connectPair(peer, channel_id) {
      let [recv_peer, chan_peer] =
        (peer.direct || peer).createDirect(
          pkt => recv_self(pkt), channel_id);

      let [recv_self, chan_self] =
        this.createDirect(
          recv_peer, channel_id);

      return [chan_self, chan_peer] }


  , mc_connect(opt, tgt1, tgt2) {
      if ('string' === typeof opt) {
        opt = {client_id: opt};}

      let mc = new MessageChannel();
      tgt1.postMessage({hello, mc_port: mc.port1, ...opt}, [mc.port1]);

      if (tgt2 && tgt2.postMessage) {
        tgt2.postMessage({hello, mc_port: mc.port2, ...opt}, [mc.port2]); }
      else {
        return this.connectMsgPort(mc.port2, tgt2) } }

  , mc_server(host, options={}) {
      let id_pre = options.channel_id || 'mcsv-';
      let subscribe = options.subscribe || _on_msg_evt;
      subscribe(host, (data, evt) => {
        if (data && hello == data.hello) {
          if (evt) {evt.stopPropagation();}

          let chan = this.connectMsgPort(
            data.mc_port || evt.ports[0],
            {... options
              , channel_id: `${id_pre}${data.client_id}`} );

          if (options.on_mc_connection) {
            options.on_mc_connection(chan, data);} } } ); } };


  return hub => {
    let direct ={
      __proto__: _direct_
    , p2p

    , createDirect(dispatch, channel_id) {
        if ('function' !== typeof dispatch) {
          throw new TypeError}

        let [recv, channel] = hub.router.send_channel(
          this.p2p || hub.p2p, dispatch);
        return [recv, channel.init(channel_id || 'direct')] }

    , connectMsgPort(tgt, options={}) {
        if (null == options) {options = {};}

        let [tgt_send, tgt_recv] = Array.isArray(tgt) ? tgt : [tgt, tgt];

        let [recv, channel] = hub.router.send_channel(
          this.p2p || hub.p2p,
          (tgt_send.postMessage || tgt_send.send).bind(tgt_send));

        let subscribe = options.subscribe || _on_msg_evt;
        subscribe(tgt_recv, recv);

        if (tgt_recv.close) {
          channel.close = (() =>(tgt_recv.close(), true)); }

        return channel.init(options.channel_id || 'messageport') } };


    hub.direct = {__proto__: direct};}

  function _on_msg_evt(tgt_recv, fn_recv_pkt) {
    if (tgt_recv.on) {
      tgt_recv.on('message', fn_recv_pkt); }
    else {
      tgt_recv.onmessage = evt => fn_recv_pkt(evt.data, evt);} } }

function web_basic_api(hub, plugin_options) {
  const yes = (() =>true);

  let hello = plugin_options.hello || 'mc';

  return {
    connect(tgt, options) {
      let channel = this.createChannel(tgt, options);
      if (null == channel.channel_id) {
        channel.channel_id = 'web_basic';}

      return channel.init(channel.channel_id) }

  , createChannel(tgt, options) {
      if (null == options) {options = {};}

      let [tgt_send, tgt_recv] = Array.isArray(tgt) ? tgt : [tgt, tgt];

      let {codec} = options;
      let args =[
        this.p2p || hub.p2p,
        (tgt_send.postMessage || tgt_send.send).bind(tgt_send),
        codec];

      let [recv, channel] = codec
        ? hub.router.codec_channel(...args)
        : hub.router.send_channel(...args);
      channel.channel_id = options.channel_id;

      if (tgt_recv.close) {
        channel.close = (() =>(tgt_recv.close(), true)); }

      let subscribe = options.subscribe || _on_msg_evt;
      subscribe(tgt_recv, recv, options.accept || yes);

      if ('function' === typeof tgt_recv.start) {
        tgt_recv.start();}
      return channel}


  , mc_connect(opt, tgt1, tgt2) {
      if ('string' === typeof opt) {
        opt = {client_id: opt};}

      let mc = new MessageChannel();
      tgt1.postMessage({hello, mc_port: mc.port1, ...opt}, [mc.port1]);
      if (tgt2 && tgt2.postMessage) {
        tgt2.postMessage({hello, mc_port: mc.port2, ...opt}, [mc.port2]); }
      else {
        return this.connect(mc.port2, tgt2) } }

  , mc_server(host, options={}) {
      let id_pre = options.channel_id || 'mcsv-';
      host.addEventListener('message', evt => {
        let {data} = evt;
        if (data && hello == data.hello) {
          if (evt) {evt.stopPropagation();}

          let chan = this.connect(
            data.mc_port || evt.ports[0],
            {... options
              , channel_id: `${id_pre}${data.client_id}`} );

          if (options.on_mc_connection) {
            options.on_mc_connection(chan, data);} } } ); }


  , p2p: plugin_options.p2p}


  function _on_msg_evt(tgt_recv, fn_recv_pkt, fn_accept) {
    tgt_recv.addEventListener('message',
      evt => true === fn_accept(evt) && fn_recv_pkt(evt.data, evt)
    , {passive: true} ); } }

function web_stream_api(hub, plugin_options) {
  return {
    connectStream(tgt, options) {
      let channel = this.createStreamChannel(tgt, options);
      if (null == channel.channel_id) {
        channel.channel_id = 'web_stream';}

      return channel.init(channel.channel_id) }

  , createStreamChannel(tgt, options) {
      if (! options || ! options.codec) {
        let codec = this.codec || hub.stream_codec;
        options = {codec, ... options};}

      return this.createChannel(tgt, options) }

  , codec: plugin_options.codec} }

function websocket_api(hub, plugin_options) {
  return {
    connectWS(ws_or_wss_url, channel_id) {
      let websock = ws_or_wss_url.send
        ? ws_or_wss_url
        : this.createWS(ws_or_wss_url);

      if (undefined === websock) {
        throw new TypeError(`Invalid websocket connection`) }

      if (null == channel_id) {channel_id = 'websocket';}
      let channel = this.createWSChannel(websock, {channel_id});
      return channel.init()}


  , createWSChannel(websock, options) {
      let channel = this.createStreamChannel(websock, options);
      Object.defineProperty(channel, 'websock', {value: websock});

      return Object.assign(channel,{
        when_opened: new Promise(resolve => {
          websock.addEventListener('open'
          , (() =>resolve())
          , {passive: true, once: true} ); } )

      , when_closed: new Promise(resolve => {
          websock.addEventListener('close'
          , (() =>resolve())
          , {passive: true, once: true} ); } )

      , get ready() {
          return new Promise((resolve, reject) => {
            switch (websock.readyState) {
              case 0: // connecting state
                this.when_opened.then (() =>resolve(true));
                this.when_closed.then (() =>resolve(false));
                return

              case 1: return resolve(true)
              default: return resolve(false)} } ) } } ) }


  , WebSocket: plugin_options.WebSocket
  , createWS(ws_or_wss_url) {
      let _WebSocket = this.WebSocket || WebSocket;
      return new _WebSocket(ws_or_wss_url+'', plugin_options.protocols) } } }

function web_full_plugin(plugin_options={}) {
  // websocket extends basic, and is thus the superset
  return hub => {
    hub.registerProtocols(['ws', 'ws:', 'wss', 'wss:'],
      url => hub.web.connectWS(url, true));

    hub.web ={__proto__:{
      ... web_basic_api(hub, plugin_options),
      ... web_stream_api(hub, plugin_options),
      ... websocket_api(hub, plugin_options),} }; } }

const _pi_cmp = (a, b) => (0 | a && a.order) - (0 | b && b.order);
function _pi_apply(key_list, pluginList, ...args) {
  for (let key of key_list) {
    key = key || null;

    for (let plugin of pluginList || []) {
      if (! plugin) {continue}
      if (null !== key) {
        plugin = plugin[key];}
      if (is_func(plugin) ) {
        plugin(...args);} } } }

function bind_codec(codec) {
  // For use with `codec_channel` of 'code/channel.jsy'

  // Also see plugins/standard/json_codec.jsy
  //  and see plugins/cbor/cbor_codec.jsy

  as_func(codec.encode);
  as_func(codec.decode);
  const cache = new WeakMap();
  return {
    codec

  , encode_pkt(pkt) {
      let pkt_data = cache.get(pkt);
      if (undefined === pkt_data) {
        let id_route, id_target, meta, body;
        if (is_array(pkt)) {
          if (3 === pkt.length) {
            ([ id_route, id_target, body ] = pkt);}
          else 
            ([ id_route, id_target, meta, body ] = pkt);}

        else {
          ({ 0: id_route, 1: id_target, meta, body } = pkt);}

        pkt_data = codec.encode([
          id_route, id_target, meta, body]);

        cache.set(pkt, pkt_data);}
      return pkt_data}

  , decode_pkt(pkt_data) {
      let pkt_vec = codec.decode(pkt_data);
      let [id_route, id_target, meta, body] = pkt_vec;
      let pkt = {0: id_route, 1: id_target, meta, body};
      cache.set(pkt, pkt_data);
      return pkt} } }

const ao_done = Object.freeze({ao_done: true});

function ao_when_map(ao_fn_v, db=new Map(), reject_deleted) {
  let idx_del = reject_deleted ? 2 : 1;
  return {
    has: k => db.has(k)
  , get: k => at(k)[0] // promise of deferred
  , set: define, define
  , delete(k) {
      let b, e = db.get(k);
      if (b = (undefined !== e)) {
        db.delete(k);
        e[idx_del](); }// e.g. resolve(undefined)
      return b}
  , clear() {
      // "delete" remaining on next promise tick
      p = Promise.resolve();
      for (let e of db.values()) {
        p.then(e[idx_del]); }// e.g. resolve (undefined)

      db.clear(); } }// clear db

  function at(k) {
    let e = db.get(k);
    if (undefined === e) {
      db.set(k, e=ao_fn_v());}
    return e}

  function define(k, v) {
    let [p, fn_fulfill] = at(k);
    fn_fulfill(v); // e.g. deferred's resolve(v) or fence's resume(v)
    return p } }// promise of deferred

function ao_defer_ctx(as_res = (...args) => args) {
  let y,n,_pset = (a,b) => { y=a, n=b; };
  return p =>(
    p = new Promise(_pset)
  , as_res(p, y, n)) }

const ao_defer_v = /* #__PURE__ */
  ao_defer_ctx();

const ao_defer_when = db =>
  ao_when_map(ao_defer_v, db);

function ao_fence_v() {
  let x, p=0;
  let fence  = () => ( 0!==p ? p : p=(x=ao_defer_v())[0] );
  let resume = ans => { if (0!==p) { p=0; x[1](ans); }};
  let abort  = err => { if (0!==p) { p=0; x[2](err || ao_done); }};
  return [fence, resume, abort] }


const ao_fence_when = db =>
  ao_when_map(ao_fence_v, db);

function ao_track_v(reset_v = ()=>ao_defer_v()) {
  // like ao_defer_v() and resetable like ao_fence_v()
  let r; // r is the current / tracked value defined below
  let x=reset_v(); // x is the future/deferred

  let p; // p is the rachet memory for the fence() closure
  // similar to fence.fence() while also tracking the last completed deferred
  let fence = ftr =>(
    false===ftr ? r[0] : true===ftr ? x[0] : // non-racheting queries
    p===x[0] || p===r[0] ? p=x[0] : p=r[0] );// racheting query

  // like fence.resume, resolves the future/deferred x[0]; then resets x future/deferred
  let resume = ans => xz(x[1], ans);

  // like fence.abort, rejects the future/deferred x[0]; then resets x future/deferred
  let abort  = err => xz(x[2], err || ao_done);

  // match ao_defer_v() of [current promise, resolve, reject] with additional [fence, ftr promise]
  return r = [ p=x[0], resume, abort, fence, x[0] ]

  function xz(xf, v) {
    // 1. update current / tip slot: r[0] = x[0]
    // 2. re-prime fence: x = reset_v(r[0]]
    x = reset_v(r[0] = x[0]);
    r[4] = x[0]; // update public ftr slot
    xf(v); } }// resume/abort r[0] current / tip

const ao_track_when = db =>
  ao_when_map(ao_track_v, db);

function ao_push_stream(as_vec) {
  let q=[], [fence, resume, abort] = ao_fence_v();
  let stream = ao_stream_fence(fence);

  return Object.assign(stream,{
    stream
  , abort
  , push(... args) {
      if (true === as_vec) {
        q.push(args);}
      else q.push(... args);

      resume(q);
      return q.length} } ) }


function ao_stream_fence(fence) {
  let [when_done, res_done, rej_done] = ao_defer_v();
  let res = _ao_stream_fence(fence, res_done, rej_done);
  res.when_done = when_done;
  return res}


async function * _ao_stream_fence(fence, resolve, reject) {
  try {
    let p_ready = fence();
    while (1) {
      let batch = await p_ready;
      batch = batch.splice(0, batch.length);

      p_ready = fence();
      yield * batch;} }

  catch (err) {
    if (!err || err.ao_done) {
      resolve(true);}
    else reject(err);} }

Promise.resolve({type:'init'});

const timeout_ttl ={
  extend: false
, reset() {this.extend = true; return this}
, with_reset(fn) {return (...args) =>(this.reset(), fn(...args))}

, create_ttl(query_ttl) {
    let self ={__proto__: this,
      async _query_ttl(cancel) {
        try {
          if (query_ttl) {
            await query_ttl(self);} }
        finally {
          if (! self.extend) {
            cancel();}
          self.extend = false;} } };

    return self} };


function bindTimeouts(ms_interval, on_fn_error) {
  ms_interval = (0 | ms_interval) || 67; // 15 ticks per second

  const qz = [[], []];
  _unref(setInterval(tick, ms_interval, Promise.resolve(add)));

  let [f_tick, resolve_tick] = ao_fence_v();
  let [f_empty, resolve_empty] = ao_fence_v();

  return o_assign(add,{
    add, f_tick, f_empty

  , ao_defer_v, ao_fence_v,
    ao_when: ao_defer_when, ao_track_when, ao_fence_when,
    ao_push_stream,

    async absent(absent, ...args) {
      let res = await this.race(...args);
      return this !== res ? res : absent}

  , race(ms_min_timeout, ...promises) {
      let dp = ao_defer_v();
      promises.push(dp[0]);
      add(ms_min_timeout, dp[1]);
      return Promise.race(promises)}

  , interval(ms_opt, callback) {
      ms_opt = _as_ms_opt(ms_opt, {z: 1});
      as_func(callback);

      let x ={
        cancel() {x = null;}
      , interval() {
          if (x) {callback(x.cancel);}
          if (x) {x.schedule();} }
      , schedule() {
          if (x) {
            add(ms_opt, x.interval); }
          return x.cancel} };

      if (ms_opt.initial) {
        callback(x.cancel);}
      return x.schedule()}

  , hashbelt(ms_opt, max_length=4, create=Object) {
      let belt = [create()];
      add.interval(ms_opt, rotate_belt);
      return belt

      function rotate_belt() {
        while (max_length <= belt.length) {
          belt.pop();}
        belt.unshift(create()); } }

  , ttl(ms_opt, query_ttl) {
      let ttl = timeout_ttl.create_ttl(query_ttl);
      ttl.cancel = add.interval(
        _as_ms_opt(ms_opt, {ms: 60000, z:1})
      , ttl._query_ttl);
      return ttl} } )


  function add(ms_opt, callback) {
    let res;
    if (! callback) {
      // default to a promise
      [res, callback] = ao_defer_v();}

    ms_opt = _as_ms_opt(ms_opt);

    let idx = Math.max(1, Math.ceil(ms_opt.ms / ms_interval));

    let z = 0|ms_opt.z;
    let _q = qz[z];
    if (! _q) {_q = qz[z] = [];}

    let _qi = _q[idx];
    if (! _qi) {_q[idx] = _qi = [];}

    _qi.push(as_func(callback));

    return res}

  function tick(p_self) {
    let _q, tip;
    for (_q of qz) {
      if (tip = _q.shift()) {
        for (let fn of tip) {
          p_self.then(fn).catch(on_fn_error);} } }

    if (0 === qz[0].length) {
      resolve_empty(add);}
    resolve_tick(add);} }

function _as_ms_opt(opt, def) {
  return 'number' === typeof opt
    ? {... def, ms: opt}
    : {... def, ... opt}}

function bindCoreDispatchRouter(hub_router, hub, routes_map) {
  // to create loopback, shim .dispatch onto a temporary prototype
  const loopback = ({ dispatch, __proto__: hub_router}).local_channel();

  const router_ctx ={
    hub, hub_router, timeouts: hub_router.timeouts,
    loopback, send: loopback.send
  , to(id) {return (...z) => this.send(id, ...z)} };

  const pktctx0 ={__proto__: router_ctx,
    // get send_direct() :: return this.channel.send
    redispatch: dispatch_one
  , with_reply(id_reply) {
      if (id_reply) {
        this.reply = id_reply ? this.to(id_reply) : null;
        this.done = this.with_reply;}
      else {
        delete this.reply;
        delete this.done;}
      return this} };


  return {dispatch, resolveRoute, loopback, router_ctx,}


  function dispatch(pkt, channel) {
    return dispatch_one(pkt,{channel, pkt, __proto__: pktctx0}) }

  async function dispatch_one(pkt, pktctx) {
    pkt = await pkt;
    if (undefined === pkt || null === pkt) {return}

    let id_route = pkt[0] || '';
    let route = id_route
      ? routes_map.get(id_route)
      : (pktctx.channel || {}).peerRoute;

    if (undefined === route) {
      if (pkt.bcast) {return }// don't discover/warn on broadcast packet

      try {
        route = await resolveRoute(id_route, true, true);

        if (undefined === route) {
          let channel = pktctx.channel;
          return channel && channel.undeliverable(pkt, 'route')} }
      catch (err) {
        hub_router._on_error('hub_dispatch_one', err, {pkt, pktctx}); } }

    // No errors may pass -- send all errors to hub_router.on_dispatch_error
    try {
      await route(pkt, pktctx);}
    catch (err) {
      hub_router.on_dispatch_error(err, {pkt, pktctx}); }
    finally {
      pktctx.channel = undefined; } }// release channel referenece

  function _resolveRoute0(id_route) {
    let idx, route = routes_map.get(id_route);
    // search for shared path routes based on '.' seperator
    while (undefined === route && (-1 !==(idx = id_route.lastIndexOf('.', idx))) ) {
      route = routes_map.get(id_route.slice(0, idx--)); }
    return route}

  async function resolveRoute(id_route, allowDiscover, allowUpstream) {
    let route = _resolveRoute0(id_route);
    if (undefined !== route) {return route}

    if (allowDiscover) {
      await hub_router.discoverRoute(id_route, router_ctx);
      route = _resolveRoute0(id_route);
      if (undefined !== route) {return route} }

    if (allowUpstream) {
      // otherwise send upstream
      await hub_router.upstreamRoute(id_route);
      route = routes_map.get(id_route);}

    return route} }


function bindCoreRouterAPI(hub_router, hub, routes_map) {
  // Allow individual queries but not enumeration
  let _use_override = {override: true};
  let _use_existing = {override: false};

  let db_when = ao_track_when();
  return {
    whenRoute: db_when.get

  , addRoute(id_route, route, opt) {
      as_func(route);

      opt = true === opt ? _use_override
        : opt || _use_existing;

      if (! opt.override && routes_map.has(id_route)) {
        return}

      routes_map.set(id_route, route);
      let cancel = (() =>this.removeRoute(id_route, route));

      db_when.define(id_route, id_route);
      if (! opt.ms_ttl) {
        return {route, cancel} }

      else {
        let ttl = hub_router.timeouts.ttl(opt.ms_ttl, cancel);
        ttl.route = false === opt.ttl_reset ? route
          : route = ttl.with_reset(route);
        return ttl} }

  , removeRoute(id_route, route) {
      if (1 === arguments.length) {
        route = id_route.route || id_route;
        id_route = id_route.id_route || id_route[0];}

      if (null == route || route === routes_map.get(id_route)) {
        // remove only if route is currently at id_route
        db_when.delete(id_route);
        return routes_map.delete(id_route) }
      return false}

  , getRoute(id_route) {
      return routes_map.get(id_route)}

  , hasRoute(id_route) {
      return routes_map.has(id_route)}

  , ... bindCoreDispatchRouter(
          hub_router, hub, routes_map) } }

const channel_kinds ={
  raw_channel, send_channel, codec_channel, local_channel};

const base_channel ={
  channel_id: null

, toJSON() {throw new Error('Not serializable')}
, to_cbor_encode() {throw new Error('Not serializable')}

, undeliverable(pkt, mode) {
    let {0: id_route, 1: id_target} = pkt;
    console.warn('~~ undeliverable',
      {mode, id_route, id_target} ); }

, on_send_error(err) {
    console.warn('~~ channel send error', err); }

, addRoute(id_route, opt) {
    return this.router.addPeer(
      id_route, this, opt) }

, get peerRoute() {
    let {p2p} = this;
    return p2p ? p2p.peerRoute.bind(p2p) : Boolean}

, close() {return false}

, async init(channel_id) {
    if (undefined === this.peer_info) {
      this.peer_info = p_res(this.ready)
        .then (() =>this.p2p ? this.p2p.hello() : null);
      this.peer_info.catch(Boolean); }// supress 'unhandled rejection' warnings

    if (channel_id) {
      this.channel_id = channel_id;}
    return await this} };


function as_send_pkt(args) {
  let id, meta, body, flags;
  switch (args.length) {
    case 0: return

    case 1:
      id = args[0]; // ensure id_route and id_target are strings
      return {... id, 0:`${id[0]}`, 1:`${id[1]}`}

    case 2:
      // args shape is [[id_route, id_target], body]
      ([id, body] = args);
      break

    case 3:
      if ('string' === typeof args[0]) {
        // args shape is [id_route, id_target, body]
        ([,, body] = id = args); }
      else {
        // args shape is [[id_route, id_target], meta, body]
        ([id, meta, body] = args); }
      break

    case 4: case 5:
      // args shape is [id_route, id_target, meta, body, flags]
      ([,, meta,body,flags] = id = args);
      break

    default: throw new TypeError()}

  return {... flags, 0:`${id[0]}`, 1:`${id[1]}`, body, ... meta && {meta}, }}


function raw_channel(p2p, unpack, chan_ex) {
  let channel = o_assign(o_create(this._channel_), chan_ex);

  if (null != p2p) {
    if (! p2p.hello || ! p2p.peerRoute) {
      throw new TypeError}

    channel.p2p = p2p.initForChannel(channel);}

  let r_disp = this.dispatch;
  let recv = unpack
    ? async pkt => r_disp(await unpack(await pkt), channel)
    : async pkt => r_disp(await pkt, channel);

  return [recv, channel] }


function send_channel(p2p, dispatch) {
  return this.raw_channel(p2p, null,{
    dispatch
  , send: async (...args) =>
      dispatch(await as_send_pkt(args))
  , send_pkt: async pkt =>
      dispatch(await pkt) } ) }


function codec_channel(p2p, dispatch, {encode_pkt, decode_pkt}) {
  // see plugin/standard/json_codec.jsy for a codec implementation
  return this.raw_channel(p2p, decode_pkt,{
    dispatch: async pkt =>
      dispatch(await encode_pkt(pkt))
  , send: async (...args) =>
      dispatch(await encode_pkt(as_send_pkt(args) ))
  , send_pkt: async pkt =>
      dispatch(await encode_pkt(pkt)) } ) }



function local_channel() {
  let pkt_id=1, map = new Map();

  // use MessageChannel for Structured Clone
  let { port1, port2 } = new MessageChannel();

  let send_pkt = pkt => {
    let id=pkt_id++, dp=ao_defer_v();
    map.set(id, dp);
    port1.postMessage([id, pkt]);
    return dp[0]};


  port2.onmessage = evt => {
    let [id, pkt] = evt.data;
    let [p, resolve, reject] = map.get(id);
    map.delete(id);

    try {
      let res = recv(pkt);
      resolve(res);}
    catch (err) {
      channel.on_send_error(err);
      reject(err);} };

  let [recv, channel] = this.raw_channel(null, null,{
    is_local: true, addRoute: null
  , dispatch: this.dispatch,
    send: (...args) => send_pkt(as_send_pkt(args))
  , send_pkt
  , ref() {_ref(port2);}
  , unref() {_unref(port2);} } );

  _unref(port2);
  return channel}

class FabricRouter {
  constructor(hub, {ms_interval}) {
    o_assign(this,{
      timeouts: bindTimeouts(ms_interval, err => this._on_error('timer', err)),
      _channel_:{__proto__: base_channel, router: this}
    , public_routes: this._initPublicRoutes()} );

    let self = o_create(this);
    if (! this._skip_bind_api) {
      o_assign(this,
        bindCoreRouterAPI(self, hub, this._initRoutes()) ); }
    return self}

  _initRoutes() {return new Map()}
  _initPublicRoutes() {return new Map()}

  _on_error(scope, err) {console.error('router', scope, err);}
  on_dispatch_error(err) {this._on_error('hub_dispatch', err);}

  ref() {this.loopback.ref();}
  unref() {this.loopback.unref();}

  async publishRoute(route) {
    await route.ready;
    let id_route = route.id_route;
    if ('string' === typeof id_route) {
      this.public_routes.set(id_route, route);
      return route} }

  setUpstream(upstream, opt) {
    if (null != opt) {this.upstream_opt = opt;}

    return this.upstream = as_func(
      upstream.dispatch || upstream.send || upstream) }

  upstreamRoute(id_route) {
    let { upstream, upstream_opt } = this;
    if (upstream) {
      return this.addDynamic(id_route, upstream, upstream_opt) } }


  discoverRoute(id_route, router_ctx) {
    }// see plugins/discovery


  addPeer(id_route, channel, opt) {
    let disp = channel.dispatch || channel.send;
    let res = this.addRoute(id_route, disp, opt);
    if (res && channel.when_closed) {
      channel.when_closed.then(res.cancel); }
    return res}

  addDynamic(id_route, route, opt) {
    return is_func(route)
      ? this.addRoute(id_route, route, opt)
      : this.addPeer(id_route, route, opt)}

  /* // from bindCoreRouterAPI

  addRoute(id_route, route, override) : [route, bound removeRoute]
  removeRoute(id_route, route) : Boolean
  removeRoute({id_route}) : Boolean

  hasRoute(id_route) : Boolean

  dispatch(pkt, channel) : Promise
  resolveRoute(id_route, allowDiscover, allowUpstream) : route function

  loopback
  router_ctx
  */}



o_assign(FabricRouter.prototype, channel_kinds,{
  upstream_opt:{ms_ttl: 60000} } );

const xpkt_body = pkt => pkt.body;

function bindCoreDispatchTarget(tgt_router, targets_map, id_route, router) {
  // as closures over private variables (targets_map)
  return {ready: _add_target_route(id_route)}

  async function target_route(pkt, pktctx) {
    let id_target = pkt[1] || '';
    let target = targets_map.get(id_target);

    if (undefined === target) {
      if (pkt.bcast) {return }// don't discover/warn on broadcast packet

      await tgt_router.discoverTarget(id_target, pktctx);
      target = targets_map.get(id_target);

      if (undefined === target) {
        let channel = pktctx.channel;
        return channel && channel.undeliverable(pkt, 'target')} }

    // do not await _target_dispatch so handlers do not block other messages
    _target_dispatch(target, pkt, pktctx);}


  async function _target_dispatch(target, pkt, pktctx) {
    // No errors may pass -- send them to tgt_router.on_dispatch_error
    try {
      pktctx.tgt_router = tgt_router;

      // Trigger on_sent for internal hub routing
      p_then(pkt.on_sent, pkt);

      await target(pkt, pktctx);}
    catch (err) {
      tgt_router.on_dispatch_error(err, {pkt, pktctx}); }
    finally {
      pktctx.tgt_router = undefined; } }// release tgt_router referenece


  async function _add_target_route(id_route) {
    if ('string' !== typeof id_route) {
      id_route = await id_route;}
    tgt_router.id_route = target_route.id_route = id_route;
    router.addRoute(id_route, target_route, true);
    return true} }


function bindCoreTargetAPI(tgt_router, targets_map, id_route, router) {
  return {
    addTarget
  , hasTarget: id_target => targets_map.has(id_target)
  , getTarget: id_target => targets_map.get(id_target)

  , removeTarget: id_target =>
      targets_map.delete(
        'string'===typeof id_target
          ? id_target
          : id_target[1])

  , addDefer_v
  , xstream

  , ... bindCoreDispatchTarget(
          tgt_router, targets_map,
          id_route, router) }

  function addTarget(id_target, target, with_remove) {
    let id =[id_route, id_target || tgt_router.newTargetId()];

    // .id comaptibility mirroring xstream() return value
    Object.defineProperty(id, 'id', {value: id});

    if (null != target) {
      targets_map.set(id[1], as_func(target)); }
    return id}

  function addDefer_v(target=true, inc_pktctx=false, dp=ao_defer_v()) {
    let id = addTarget(null,
      ! inc_pktctx ? dp[1] // resolve with just the packet
        : (...zpkt) => dp[1](...zpkt) );// resolve with the args array

    let p = dp[0];
    tgt_router.removeAfter(id, p);
    if (target) {
      p = p.then(true === target ? xpkt_body : target);}

    return {
      id, 0: id[0], 1: id[1],
      promise: p, abort: dp[2]} }

  function xstream(id_target, xapi) {
    let {stream, when_done, abort, push} = ao_push_stream(true);
    let id = addTarget(id_target, push);
    tgt_router.removeAfter(id, when_done);
    return {__proto__: xapi,
      id, 0: id[0], 1: id[1],
      stream, abort, when_done, tgt_router} } }

class TargetRouter {

  constructor(id_route, router, hub) {
    let {randId} = hub, {timeouts, send, loopback} = router.router_ctx;
    o_assign(this,{timeouts, send, loopback, randId});

    if (this._skip_bind_api) {return this}

    let self = o_create(this);
    o_assign(this,
      bindCoreTargetAPI(self, this._initTargets(), id_route, router) );
    return self}

  _initTargets() {return new Map()}
  _on_error(scope, err) {console.error('target', scope, err);}
  on_dispatch_error(err) {this._on_error('tgt_dispatch', err);}
  get _on_stream_error() {
    return err => this._on_error('stream', err)}

  newTargetId() {return this.randId(4)}

  discoverTarget(id_target, pktctx) {
    }// see plugins/discovery


  /* // from bindCoreTargetAPI

  ready : Promise<Boolean>

  addTarget(id_target, target, opt) : [id_route, id_target]
  hasTarget(id_target) : Boolean
  getTarget(id_target) : function(pkt, pktctx)
  removeTarget(id_target) : Boolean
  removeTarget([id_route, id_target]) : Boolean

  addDefer_v(target, inc_pktctx, dp=ao_defer_v()) : {id, promise}

  xstream(id_target, xapi) : tgt_stream_obj<xapi>
    where tgt_stream_obj is {__proto__: xapi, id, stream, abort, when_done, tgt_router}

  */

  addOnce(ms, absent, target=true) {
    let xtgt = this.addDefer_v(target, false);
    // setup timeout.absent to cancel deferred
    xtgt.promise = this.timeouts.absent(
      absent, ms, xtgt.promise);

    // enusre the root defered is resolved or rejected
    xtgt.promise.then(xtgt.abort);
    return xtgt}

  addStream(id_target, async_target, on_error=this._on_stream_error) {
    let xtgt = this.xstream(id_target);
    xtgt.when_done = async_target(xtgt).catch(on_error);
    return xtgt}

  async removeAfter(id_target, p_done) {
    try {
      try {
        await p_done;}
      finally {
        if (id_target) {
          this.removeTarget(id_target);} } }
    catch (err) {
      if (err instanceof Error) {
        this._on_error('after', err);} } } }

class FabricHub$2 {
  get is_fabric_hub() {return true}

  static create(...args) {return new this(...args)}

  constructor(... opt_args) {
    let self = o_create(this);
    let options = this.options = this._initOptions({}, opt_args);

    _pi_apply(['pre'], this._plugins_, self);

     {
      let router = self._initHubRouter(options);
      let {loopback} = router;
      o_assign(this,{
        _root_: this
      , router, loopback, send: loopback.send,
        _url_protos: {}} ); }

    this.local = self._initLocal(options);

    _pi_apply([null, 'post'], this._plugins_, self);
    return self}

  _initOptions(options, opt_args) {
    for (let opt of opt_args) {
      if ('string' === typeof opt) {
        options.id_route = opt;}
      else o_assign(options, opt);}
    return options}

  _initHubRouter(options) {
    return new this.constructor.FabricRouter(this, options)}
  _initLocal(options) {
    return this.localRoute(options.id_route)}

  localRoute(id_route, is_private) {
    if (null == id_route) {id_route = this.newRouteId();}
    let local = new this.constructor.TargetRouter(
      id_route, this.router, this);

    if (! is_private) {this.router.publishRoute(local);}
    return local}

  get timeouts() {return this.router.timeouts}
  newRouteId(id_path, opt=this.options) {
    return `${opt.id_prefix||''}${id_path||''}${this.randId(5)}${opt.id_suffix||''}`}

  randId(n) {return Math.random().toString(36).slice(2)}

  async connectUpstream(upstream) {
    upstream = await upstream;
    if (! upstream.peer_info) {
      upstream = await this.connect(upstream);}
    await upstream.peer_info;

    let res = this.router.setUpstream(upstream);
    if (! res) {throw new TypeError()}
    return upstream}

  connect(conn_url) {
    if (! conn_url.protocol) {
      conn_url = new URL(
        conn_url.asURL ? conn_url.asURL() : ''+conn_url); }

    let connect = this._url_protos[conn_url.protocol];
    if (! connect) {
      throw new Error(`Connection protocol "${conn_url.protocol}" not found`) }
    return connect(conn_url)}

  registerProtocols(protocolList, cb_connect) {
    as_func(cb_connect);
    for (let protocol of protocolList) {
      this._url_protos[protocol] = cb_connect;}
    return this}

  // --- stream codec support

  bind_codec(codec) {
    return bind_codec(codec)}

  as_stream_codec(codec) {
    return this.stream_codec =
      this.bind_codec(codec)}

  // --- plugin support ---

  livePlugin(... _plugins_) {
    _plugins_.sort(_pi_cmp);

    _pi_apply(['live', null, 'post'], _plugins_, this);
    return this}

  static plugin(... _plugins_) {
    _plugins_ = o_freeze(
      [... this._plugins_ || [], 
       ... _plugins_,
      ].sort(_pi_cmp) );

    let inst_plugins = _plugins_.slice();

    class FabricHub extends this {}
    FabricHub.prototype._plugins_ = inst_plugins;

    o_assign(FabricHub,{
      FabricRouter: (class extends (this.FabricRouter || FabricRouter) {}),
      TargetRouter: (class extends (this.TargetRouter || TargetRouter) {}),
      _plugins_} );

    _pi_apply(['subclass'], _plugins_, FabricHub, inst_plugins);
    inst_plugins.sort(_pi_cmp );// re-sort inst_plugins if extended during 'subclass'
    _pi_apply(['proto'], inst_plugins, FabricHub.prototype);

    return FabricHub}


  /* Plugin Provided (plugin/standard or similar):

       stream_codec: @{}
         encode_pkt(pkt) : pkt_data
         decode_pkt(pkt_data) : pkt

       p2p: @{}
        hello(ms_timeout=500) : Promise of peer_info
        peerRoute(pkt, pktctx) : awaitable

  */}

var FabricHub$1 = FabricHub$2.plugin();

var FabricHub = FabricHub$1.plugin(
  json_codec_plugin()
, p2p_plugin()
, discovery_plugin()
, direct_plugin()
, web_full_plugin());

var mfJsonWeb = FabricHub.plugin(web_ids_plugin());

const mf_hub = mfJsonWeb.create();

// set up message channel server here in service worker
mf_hub.web.mc_server(self, {on_mc_connection});

async function on_mc_connection(chan, data) {
  chan = await chan;
  console.log("ServiceWorker on_mc_connection:", chan);
  let pi = await chan.peer_info;

  for (let rid of pi.routes) {
    console.log('ServiceWorker route id:', rid);
    chan.send([rid, 'well-known'], 'hello from ServiceWorker');
    // ...
  }
}


self.addEventListener('install', evt => {
  console.log('service worker install', evt);
});
//# sourceMappingURL=svc_worker.js.map
