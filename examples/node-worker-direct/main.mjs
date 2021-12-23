import { Worker } from 'node:worker_threads'
import MsgFabric from 'msg-fabric-core/esm/mf-json-node.js'


console.log('Main started, using direct worker ports')

export const mf_hub = MsgFabric.create()
export default mf_hub

export const mf_chan_worker = _mf_demo_node_worker()


async function _mf_demo_node_worker() {
  // Worker Thread style
  let _my_worker = new Worker(
    new URL('./worker.mjs', import.meta.url) )

  let mf_chan_worker =
    mf_hub.direct.connectMsgPort(_my_worker)

  mf_chan_worker.then(async chan => {
    console.log('Main connecting to worker.mjs:', chan)
    let pi = await chan.peer_info
    if (pi)
      console.log('Main connected to worker.mjs:', chan, pi)
    else 
      console.log('Main failed to connect to worker.mjs:', chan, pi)
  })

  return mf_chan_worker
}
