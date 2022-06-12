import MsgFabric from 'msg-fabric-core'

function demo_service() {
  let hub_svc = MsgFabric.create({id_prefix: 'service-example.'})
  hub_svc.router.aliasRoute(hub_svc.local.id_route)

  let id = hub_svc.local.addTarget('bingo', (pkt, pktctx) => {
    console.log('target', id,'received pkt:', pkt)
    let id_r = pkt.body.id_reply
    if (id_r)
      pktctx.send( id_r, { ts: new Date, echo: pkt.body })
  })
  return hub_svc
}


function at_random(lst, n=2) {
  lst = lst.slice()
  if (n >= lst.length)
    return lst

  for (let i=0; i<n; i++) {
    let j = i + 0|((lst.length-i)*Math.random())
    let v = lst[i]; lst[i] = lst[j]; lst[j] = v
  }
  lst.length = n
  return lst
}

async function demo_consumer(service_lst) {
  let hub = MsgFabric.create()

  service_lst = await Promise.all(
    service_lst.map(
      async hub_svc => {
        await hub.direct.connect(hub_svc)
        return hub_svc.local.id_route
      }))
  console.log(service_lst)

  hub.router.addRoute('service-example.any',
    async (pkt, pktctx) => {
      let sel = at_random(service_lst, 2)
      sel = sel.map(id_route =>
          pktctx.resolveRoute(id_route, true, true))

      let route = await Promise.race(sel)
      return route
        ? route(pkt, pktctx)
        : pktctx.undeliverable()
    })


  async function demo_send(msg) {
    const reply = hub.local.addOnce()
    hub.send(['service-example.any', 'bingo'],
      { msg, id_reply: reply.id })

    let ans = await reply.promise.catch(err=>null)
    console.log('Received reply', !!ans)
  }

  hub.router.ref()

  await demo_send({first: 1})
  await demo_send({second: 22})
  await demo_send({third: 333})
  await demo_send({fourth: 4444})

  hub.router.unref()
}

await demo_consumer([
  demo_service(),
  demo_service(),
  demo_service(),
  demo_service(),
  demo_service(),
  demo_service(),
  demo_service(),
])

console.log("END")
