import { parentPort } from 'node:worker_threads'
import MsgFabric from 'msg-fabric-core/esm/mf-json-node.js'

console.log('Worker Thread started, using parentPort directly')

export const mf_hub = MsgFabric.create()
export default mf_hub

export const mf_chan_parent =
  mf_hub.direct.connectMsgPort(parentPort)

mf_chan_parent.then(async chan => {
  console.log('Worker Thread connecting to main.mjs:', chan)
  mf_hub.connectUpstream(chan)

  let pi = await chan.peer_info
  if (pi)
    console.log('Worker Thread connected to main.mjs:', chan, pi)
  else 
    console.log('Worker Thread failed to connect to main.mjs:', chan, pi)
})
