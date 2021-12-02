# msg-fabric-core

`msg-fabric-core` is a uniform messaging API for writing distributed (network) actors. 

In a browser environment, use `msg-fabric-core` to communicate in the main
context, an IFrame, a Web Worker, over an RTCDataChannel, or over a WebSocket.

In a NodeJS environment, communciate over TCP, TLS, duplex Streams,
WebSockets, or use a plugin to bridge over NATS or MQTT.

Sent packets are synchronously cloned, thereby preventing accidental mutation.
Furthermore, packets are only encoded to bytes when needed to transmit across
a stream-oriented connection — WebSocket, RTCDataChannel, TCP/TLS, or similar
stream.

A collection of ES6 modules are published for both NodeJS and Web platforms,
as well as all the core plugins, to allow crafting a build including only is
required to solve the problem at hand.


Inspired by:

- Alan Kay's vision of messaging between objects in [Smalltalk](https://en.wikipedia.org/wiki/Smalltalk#Messages)
- [Erlang](http://erlang.org/doc/reference_manual/distributed.html)'s distributed messaging
- Uber's [Ringpop](https://github.com/uber-node/ringpop-node) and [TChannel](https://github.com/uber/tchannel-node)
- [PouchDB](https://pouchdb.com/custom.html)'s excellent plugin model


## Documentation

See [reference docs](./docs/#readme) and [examples](./examples/#readme)

## Examples

```javascript
import MsgFabric from 'msg-fabric-core' 
const hub = MsgFabric.create()
```

##### Add a Target

```javascript
const tgt_addr = hub.local.addTarget(null, pkt => {
  console.log('pkt target received pkt:', pkt)

  if (pkt.body.id_reply) {
    console.log('replying to:', pkt.body.id_reply)
    hub.send( pkt.body.id_reply, { ts: new Date, echo: pkt.body })
  }
})
```

##### Send a message and await a reply

```javascript
const reply = hub.local.addReply()
hub.send(tgt_addr,
  { msg: 'hello readme example with reply',
    id_reply: reply.id
  })

let ans = await reply.response()
console.log('Received reply', ans) 
```

### Connections and Platforms

##### Web Browser connections

Works out of the box with Web APIs like:

 - `hub.web.connect()` for:
   - [.postMessage()](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) for [IFrame's contentWindow](https://developer.mozilla.org/en-US/docs/Web/API/HTMLIFrameElement/contentWindow) and [Window](https://developer.mozilla.org/en-US/docs/Web/API/Channel_Messaging_API/Using_channel_messaging)
   - [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Worker)
   - [MessagePort](https://developer.mozilla.org/en-US/docs/Web/API/MessagePort) and [MessageChannels](https://developer.mozilla.org/en-US/docs/Web/API/MessageChannel)

 - `hub.web.connectStream()` for:
   - [RTCDataChannels](https://developer.mozilla.org/en-US/docs/Web/API/RTCDataChannel)

 - `hub.web.connectWS()` for:
   - [WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

 - `hub.web.mc_server()` and `hub.web.mc_connect()` for:
   - [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
   - [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Worker)


See [plugins/web](plugins/web/README.md)


##### NodeJS connections

Works out of the box with NodeJS APIs like:
 - `hub.tcp` for [`require('net')`](https://nodejs.org/api/net.html)
 - `hub.tls` for [`require('tls')`](https://nodejs.org/api/tls.html)
 - `hub.direct_stream` for [`require('stream')`](https://nodejs.org/api/stream.html)
 - `hub.web` for WebSockets, tested with [ws](https://www.npmjs.com/package/ws) and [faye-websocket](https://www.npmjs.com/package/faye-websocket) libraries

See [plugins/net](plugins/net/README.md)


## License

[2-Clause BSD](https://github.com/shanewholloway/msg-fabric-core/blob/master/LICENSE)

