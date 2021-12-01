import MsgFabric from 'msg-fabric-core/esm/mf-json-web.js'

const mf_hub = MsgFabric.create({id_prefix: 'wb:'})

// set up message channel server here in service worker
mf_hub.web.mc_server(self, {client_id: 'mcsw-', on_connect})

async function on_connect(conn) {
  conn = await conn
  let pi = await conn.peer_info
  for (let rid of pi.routes) {
    conn.send
    // ...
  }
}


self.addEventListener('install', evt => {
  console.log('service worker install', evt)
})

