import MsgFabric from 'msg-fabric-core/esm/mf-json-web.js'

const mf_hub = MsgFabric.create()

// set up message channel server here in service worker
mf_hub.web.mc_server(self, {on_mc_connection})

mf_hub.local.addTarget('well-known', (pkt, pktctx) => {
  console.log('ServiceWorker well-known pkt:', pkt.body)
})


async function on_mc_connection(chan, data) {
  chan = await chan
  console.log("ServiceWorker on_mc_connection:", chan)
  let pi = await chan.peer_info

  for (let rid of pi.routes) {
    console.log('ServiceWorker route id:', rid)
    chan.send([rid, 'well-known'], 'hello from ServiceWorker')
    // ...
  }
}


self.addEventListener('install', evt => {
  console.log('service worker install', evt)
})

