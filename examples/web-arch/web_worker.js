import MsgFabric from 'msg-fabric-core/esm/mf-json-web.js'

const mf_hub = MsgFabric.create()

// set up message channel server here in service worker
mf_hub.direct.mc_server(self, {on_mc_connection})

async function on_mc_connection(chan) {
  chan = await chan
  console.log("WebWorker on_mc_connection:", chan)
  let pi = await chan.peer_info

  for (let rid of pi.routes) {
    console.log('WebWorker route id:', rid)
    chan.send([rid, 'well-known'], 'hello from WebWorker')
    // ...
  }
}

