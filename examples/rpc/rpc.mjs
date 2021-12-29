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
      console.log()
      console.log('m$_first:', args)
      console.log()
      await delay(200)
      console.log('m$_first returning:', args)
      return ['called first', new Date]
    },
    async m$_second(rpcx, ...args) {
      console.log()
      console.log('m$_second:', args)
      console.log()
      await delay(10)
      console.log('m$_second returning:', args)
      return ['second invoked', Date.now()]
    },
    async m$_posting(rpcx, ...args) {
      console.log()
      console.log('m$_posting:', args)
      console.log()
      await delay(150)
      console.log('m$_posting finished:', args)
    },
  })


let rpc_client = hub.rpc.to(tgt_info.id)
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
