import FabricBaseHub from 'msg-fabric-core/esm/core.js'

// RPC-like clients and endpoints
import mfpi_rpc from 'msg-fabric-core/esm/mfpi-rpc.js'


// stream codecs
import mfpi_json from 'msg-fabric-core/esm/mfpi-json.js'
import mfpi_cbor from 'msg-fabric-core/esm/mfpi-cbor.js'

// basic peer handshaking
import mfpi_p2p from 'msg-fabric-core/esm/mfpi-p2p-basic.js'

// in-process direct hub-to-hub connections
import mfpi_direct from 'msg-fabric-core/esm/mfpi-direct.js'

// web-like protocols
import mfpi_web from 'msg-fabric-core/esm/mfpi-web.js'


// crypto random ids
import mfpi_ids_web from 'msg-fabric-core/esm/mfpi-ids-web.js'
import mfpi_ids_node from 'msg-fabric-core/esm/mfpi-ids-node.js'


// NodeJS network transports over TCP, TLS, or generic Node Streams,
import mfpi_net from 'msg-fabric-core/esm/mfpi-net.js'
// or, individually
import mfpi_direct_stream from 'msg-fabric-core/esm/mfpi-net-stream.js'
import mfpi_tcp_stream from 'msg-fabric-core/esm/mfpi-net-tcp.js'
import mfpi_tls_stream from 'msg-fabric-core/esm/mfpi-net-tls.js'



// compose multiple plugins
export default FabricBaseHub.plugin(
  mfpi_rpc(),
  mfpi_direct(),
)
