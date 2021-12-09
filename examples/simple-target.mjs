import MsgFabric from 'msg-fabric-core'

const hub = MsgFabric.create()
hub.router.ref() // keep alive despite no active I/O


const tgt_info = hub.local.addTarget(null, (pkt, pktctx) => {
  console.log('target received pkt:', pkt)

  let id_r = pkt.body.id_reply
  if (id_r) {
    console.log('target replying to:', id_r)
    pktctx.send( id_r, { ts: new Date, echo: pkt.body })
  }
})

console.log('Target Info:', tgt_info)


const reply = hub.local.addOnce()
hub.send(tgt_info,
  { msg: 'hello example with reply',
    id_reply: reply.id })

let ans = await reply.promise
console.log('Received reply', ans)


hub.router.unref()
