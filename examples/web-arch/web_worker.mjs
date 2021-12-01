import MsgFabric from 'msg-fabric-core/esm/mf-json-web.js'

const mf_hub = MsgFabric.create({id_prefix: 'wb:', id_suffix: ':wk'})

// set up message channel server here in service worker
mf_hub.web.mc_server(self, {client_id: 'mcww-', on_connect})


async function on_connect(conn) {
}
