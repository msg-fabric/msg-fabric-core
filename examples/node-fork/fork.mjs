import MsgFabric from 'msg-fabric-core/esm/mf-json-node.js'

console.log('Subporcess started')

export const mf_hub = MsgFabric.create()
export default mf_hub

// use process to access spawning IPC channel -- see https://nodejs.org/dist/latest-v17.x/docs/api/child_process.html#subprocesssendmessage-sendhandle-options-callback
export const mf_chan_parent =
  mf_hub.direct.connectMsgPort(process)

mf_chan_parent.then(async chan => {
  console.log('Subporcess connecting to main.mjs:', chan)
  mf_hub.connectUpstream(chan)

  let pi = await chan.peer_info
  if (pi)
    console.log('Subporcess connected to main.mjs:', chan, pi)
  else 
    console.log('Subporcess failed to connect to main.mjs:', chan, pi)
})
