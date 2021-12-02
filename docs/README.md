# MsgFabric reference

- [Sending messages](./send.md) -- `hub.send()`
- [Endpoint targets](./endpoints.md) -- `hub.local.addStream()` and `hub.local.addTarget()`
- [Hub](./hub.md) -- `hub = MsgFabric.create()`
  - [Channels and connections](./connections.md) -- `hub.connect()`
  - [Target Router](./router_targets.md) -- `hub.local`
  - [Fabric Router](./router_fabric.md) -- `hub.router`


### Premade MsgFabric Packages

- default: [`import MsgFabric from "msg-fabric-core"`](../code/mf/mf-json.jsy) uses `"msg-fabric-core/esm/mf-json.js"`
- core: [`import MsgFabric from "msg-fabric-core/esm/mf/core.js"`](../code/mf/core.jsy)

- with JSON support:
  - basic (default): [`import MsgFabric from "msg-fabric-core/esm/mf-json.js"`](../code/mf/mf-json.jsy)
  - for Web: [`import MsgFabric from "msg-fabric-core/esm/mf-json-web.js"`](../code/mf/mf-json-web.jsy)
  - for NodeJS: [`import MsgFabric from "msg-fabric-core/esm/mf-json-node.js"`](../code/mf/mf-json-node.jsy)

- with CBOR support:
  - basic: [`import MsgFabric from "msg-fabric-core/esm/mf-cbor.js"`](../code/mf/mf-cbor.jsy)
  - for Web: [`import MsgFabric from "msg-fabric-core/esm/mf-cbor-web.js"`](../code/mf/mf-cbor-web.jsy)
  - for NodeJS: [`import MsgFabric from "msg-fabric-core/esm/mf-cbor-node.js"`](../code/mf/mf-cbor-node.jsy)


### Plugins

- Transport Codecs:
  - JSON: `plugins/json`
  - CBOR: `plugins/cbor`

- Web platform
  - `plugins/ids/web`
  - `plugins/web` for using WebSocket, `MessageChannel`, `postMessage`, WebRTC, WebWorkers, ServiceWorkers, and iFrames

- NodeJS platform
  - `plugins/ids/node`
  - `plugins/net` for using TCP, TLS, and NodeJS Streams

- p2p-basic 

  Provides a basic hello protocol between fabric routers.

- Discovery (alpha)

  Pluggable discovery mechanisms for target endpoints and router connections.

- Direct connections

  Useful for peering multiple MsgFabric hubs

- rpc (alpha)

  An RPC sketch plugin. Refactor required for newer `.addStream()` target support.

