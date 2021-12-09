import MsgFabric from 'msg-fabric-core'

const hub = MsgFabric.create()
hub.router.ref() // keep alive despite no active I/O

console.log('Local', hub.local)


const tgt_info = hub.local.addStream(null, async self => {
  console.log('Stream top', self)
  await self
  console.log('Stream has same info', self === tgt_info)
  for await (let [pkt, pktctx] of self.stream) {
    console.log('Stream pkt:', pkt)
    let id_r = pkt.body.id_reply
    if (id_r) {
      console.log('Stream replying to:', id_r)
      pktctx.send( id_r, { ts: new Date, echo: pkt.body })
    }
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
