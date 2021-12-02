# MsgFabric Channels and Connections

### Web Browser connections

See [plugins/web](../plugins/web/README.md)

```javascript
hub.connect('ws://«host»:«port»')
hub.connect('wss://«host»:«port»')

hub.web.connect( a_message_channel.port1 )
hub.web.connect( a_web_worker || self )
hub.web.connect( an_iframe )

hub.web.connectWS( a_websocket )
hub.web.connectStream( an_rtc_data_channel )
```


### NodeJS connections

See [plugins/net](../plugins/net/README.md)

```javascript
hub.connect('tcp://«host»:«port»')
hub.connect('tls://«host»:«port»')

hub.tcp.createServer()
hub.tcp.connect({ host, port })

hub.tls.createServer( tls_options )
hub.tls.connect({ host, port })

hub.direct_stream.connect( hub_other )

// WebSockets also work server-side
hub.web.connectWS( a_websocket )
```


### Same-process connections

See [plugins/direct](plugins/net/README.md)

```javascript
hub.direct.connect( hub_other )
```

