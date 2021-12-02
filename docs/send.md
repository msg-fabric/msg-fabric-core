### Message `pkt` structure

```javascript
let {0: id_route, 1: id_target, meta, body} = pkt
```

##### Packet address `{0: id_router, 1: id_target}`
```javascript
let tgt_addr = [id_route, id_target]
// or
let tgt_addr = {0: id_route, 1: id_target}
```

##### Packet `{body}`
```javascript
let body = { msg: 'hello example object', ts: new Date }
// or
let body = 'hello example string'
// or
let body = ['hello example', 'list', new Date]
```

##### Optional packet `{meta}`
```javascript
let meta = { info: 'meta example object', ts: new Date }
// or
let meta = 'meta example string'
// or
let meta = ['meta example', 'list', new Date]
```

### Send a Message

```javascript
// 2 argument concise send
hub.send(tgt_addr, body)

// 3 argument concise send with meta
hub.send(tgt_addr, meta, body)
```

##### Single argument full packet

```javascript
hub.send({ 0: id_route, 1: id_target, body })

hub.send({ 0: id_route, 1: id_target, meta, body})
```

##### Direct addressed packets

```javascript
// 3 argument address send
hub.send(id_route, id_target, body)

// 4 argument address send with meta
hub.send(id_route, id_target, meta, body)
```

### Send and await a Reply

```javascript
const reply = hub.local.addReply()
hub.send(tgt_addr,
  { msg: 'hello reply example',
    id_reply: reply.id
  })

reply.then( ans => {
  console.log('Received reply', ans) })
```

