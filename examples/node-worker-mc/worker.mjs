import { parentPort } from 'node:worker_threads'
import MsgFabric from 'msg-fabric-core/esm/mf-json-node.js'

console.log('Worker Thread started, using MessageChannel server')

export const mf_hub = MsgFabric.create()
export default mf_hub

// set up message channel server here in service worker
mf_hub.direct.mc_server(parentPort, {on_mc_connection})

async function on_mc_connection(chan) {
  chan = await chan
  console.log("Worker Thread on_mc_connection:", chan)
  let pi = await chan.peer_info
  console.log("Worker Thread on_mc_connection peer_info:", pi)
  mf_hub.connectUpstream(chan)
}

