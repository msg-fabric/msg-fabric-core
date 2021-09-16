import MsgFabric from 'msg-fabric-core/esm/core.js'

const hub = MsgFabric.create()


// nodejs hack to keep the process open while asyncs are processed
let tid = setTimeout(Boolean, 1000)


const tgt_addr = hub.local.addTarget(null, pkt => {
  console.log('pkt target received pkt:', pkt)

  let id_r = pkt.body.id_reply
  if (id_r) {
    console.log('replying to:', id_r)
    hub.send( id_r, { ts: new Date, echo: pkt.body })
  }
})


const reply = hub.local.addReply()
hub.send(tgt_addr,
  { msg: 'hello readme example with reply',
    id_reply: reply.id })

let ans = await reply.response()
console.log('Received reply', ans)


if (tid.unref) tid.unref()
