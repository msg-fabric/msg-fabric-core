// this module provides `window.url_msg_fabric_hub` for Web Worker testing
import MsgFabricBase from 'msg-fabric-core/esm/index.js'
import mfpi_ids_web from 'msg-fabric-core/esm/mfpi-ids-web.js'
import mjpi_web from 'msg-fabric-core/esm/mfpi-web.js'
export default MsgFabricBase.plugin(mfpi_ids_web(), mjpi_web())
