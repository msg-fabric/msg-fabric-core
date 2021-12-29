import MsgFabric from 'msg-fabric-core'
import mfpi_rpc from 'msg-fabric-core/esm/mfpi-rpc.js'

const hub = MsgFabric
  .plugin(mfpi_rpc()) // use the RPC plugin
  .create()

hub.router.ref() // keep alive despite no active I/O

const delay = ms =>
  new Promise(y => setTimeout(y, ms))

const tgt_info = hub.rpc.ep_stateful({
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
let r_first = rpc_client.query.m$_first('hello there first', 42)
let r_second = rpc_client.query.m$_second('second, salut!', 1942)
let r_posting = rpc_client.post.m$_posting('no response expected!', 2142)

let p_all = [
  r_first.then(v => console.log('r_first.then', v)),
  r_second.then(v => console.log('r_second.then', v)),
  r_posting.then(v => console.log('r_posting.then', v)),
]

{
  console.log()
  console.log('r_first', r_first)
  console.log('r_second', r_second)
  console.log('r_posting', r_posting)
  console.log()
}

await Promise.allSettled(p_all)

hub.router.unref()
