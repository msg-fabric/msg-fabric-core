import MsgFabric from 'msg-fabric-core/esm/mf-json-web.js'

const mf_hub = MsgFabric.create({id_prefix: 'wb:', id_suffix: ':wk'})

// set up message channel server here in service worker
mf_hub.direct.mc_server(self, {client_id: 'mcww-', on_mc_connection})

async function on_mc_connection(chan) {
  chan = await chan
  console.log("on_mc_connection:", chan)
  let pi = await chan.peer_info
}

