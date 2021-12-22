import { Worker } from 'node:worker_threads'
import { fork } from 'node:child_process'

import MsgFabric from 'msg-fabric-core/esm/mf-json-node.js'


console.log('Main started')

export const mf_hub = MsgFabric.create()
export default mf_hub

export const mf_chan_worker = _mf_demo_node_worker()
export const mf_chan_fork = _mf_demo_node_fork()


async function _mf_demo_node_worker() {
  // Worker Thread style

  let mf_chan_worker =
    mf_hub.direct.connectMsgPort(
      new Worker(
        new URL('./worker.mjs', import.meta.url) ))

  mf_chan_worker.then(async chan => {
    console.log('connecting to worker.mjs:', chan)
    let pi = await chan.peer_info
    if (pi)
      console.log('connected to worker.mjs:', chan, pi)
    else 
      console.log('failed to connect to worker.mjs:', chan, pi)
  })

  return mf_chan_worker
}


async function _mf_demo_node_fork() {
  // Node Sub-process style; like cluster, but without sharing server connections
  // see https://nodejs.org/dist/latest-v17.x/docs/api/child_process.html#child_processforkmodulepath-args-options

  let mf_chan_fork =
    mf_hub.direct.connectMsgPort(
      fork(
        new URL('./fork.mjs', import.meta.url).pathname,
        [], // process args
        { serialization: 'advanced', // use structured clone algorithm
          // env: {}, // lockdown env access; default is pass-through
          // uid:, gid: // drop access to change permissions
        }) )

  mf_chan_fork.then(async chan => {
    let pi = await chan.peer_info
    if (pi)
      console.log('connected to fork.mjs:', chan, pi)
    else {
      console.log('failed to connect to fork.mjs:', chan, pi)
    }
  })
  return mf_chan_fork
}
