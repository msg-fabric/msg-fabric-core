import MsgFabric from 'msg-fabric-core'
import mfpi_rpc from 'msg-fabric-core/esm/mfpi-rpc.js'

const hub = MsgFabric
  .plugin(mfpi_rpc()) // use the RPC plugin
  .create()

hub.router.ref() // keep alive despite no active I/O

const delay = ms =>
  new Promise(y => setTimeout(y, ms))

const tgt_info = hub.rpc.endpoint({
    async m$_first(rpcx, ...args) {
      let {id_log} = rpcx.pkt.meta || {}
      console.log()
      console.log('m$_first:', args, id_log)
      if (id_log) rpcx.send(id_log, 'calling m$_first')
      console.log()
      await delay(200)
      console.log('m$_first returning:', args)
      if (id_log) rpcx.send(id_log, 'called m$_first')
      return ['called first', new Date]
    },
    async m$_second(rpcx, ...args) {
      let {id_log} = rpcx.pkt.meta || {}
      console.log()
      console.log('m$_second:', args)
      if (id_log) rpcx.send(id_log, 'calling m$_second')
      console.log()
      await delay(10)
      console.log('m$_second returning:', args)
      if (id_log) rpcx.send(id_log, 'called m$_second')
      return ['second invoked', Date.now()]
    },
    async m$_posting(rpcx, ...args) {
      let {id_log} = rpcx.pkt.meta || {}
      console.log()
      console.log('m$_posting:', args)
      if (id_log) rpcx.send(id_log, 'calling m$_posting')
      console.log()
      await delay(150)
      console.log('m$_posting finished:', args)
      if (id_log) rpcx.send(id_log, 'called m$_posting')
    },
  })


let id_log = hub.local.addTarget(null, pkt =>
  console.log('xt_log: %o', pkt.body))

let rpc_client = hub.rpc.to(tgt_info.id, {id_log})
console.log()
console.log('rpc_client', rpc_client)
console.log()

{
  console.log()
  let r_first = rpc_client.query.m$_first('hello there first', 42)
  console.log('r_first', r_first)
  console.log('await r_first', await r_first)
  console.log()
}

{
  console.log()
  let r_second = rpc_client.query.m$_second('second, salut!', 1942)
  console.log('r_second', r_second)
  console.log('await r_second', await r_second)
  console.log()
}

{
  console.log()
  let r_posting = rpc_client.post.m$_posting('no response expected!', 2142)
  console.log('r_posting', r_posting)
  console.log('await r_posting', await r_posting)
  console.log()
}

hub.router.unref()
