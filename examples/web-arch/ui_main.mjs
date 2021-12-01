import MsgFabric from 'msg-fabric-core/esm/mf-json-web.js'

const mf_hub = MsgFabric.create({id_prefix: 'wb:', id_suffix:':ui'})


let sw_conn
if (1) {
  // connect to service worker using message channel server
  sw_conn = mf_hub.web.mc_connect('ui',
      navigator.serviceWorker.controller)

  // using svc-worker for upstream routing (optional)
  sw_conn = mf_hub.connectUpstream(sw_conn)
}


if (1) { // connect to web worker
  let web_wkr = new Worker(
    new URL('./web_worker.js', import.meta.url)
    {type: 'module', name: 'ww1-awesome'})

  // connect hub to web worker using message channel server
  mf_hub.web.mc_connect('ui', web_wkr)

  if (sw_conn) {
    // connect web worker to service worker directly
    mf_hub.web.mc_connect('ww-sw', web_wkr,
      navigator.serviceWorker.controller)
  }
}

