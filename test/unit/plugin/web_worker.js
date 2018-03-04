import { expect, sleep, newLog } from '../_setup'
import { testDoubleSidedChannelConnection, testSingleSidedChannelConnection } from './_chan_tests'

export default function () ::

  it @ 'hub.web.connectPostMessage is a channel', async function() ::
    this.slow(300)

    const src_wkr = asIIFEString('self', webWorkerActual)
      .replace @ 'URL_MSG_FABRIC_HUB',
        JSON.stringify(window.url_msg_fabric_hub)

    const wkr_actual = new Worker @
      asIIFEWebWorkerURL(src_wkr)

    await testSingleSidedChannelConnection @:
      from_tag: 'webworker'
      connect(hub) ::
        return hub.web.connectPostMessage @ wkr_actual

    function webWorkerActual(self) ::
      // Make UMD file work by making "global" global self-referencing.
      // Wow. Fortunately, the code is less confusing:
      Object.defineProperty @ self, 'global', {value: self}

      try :: importScripts(URL_MSG_FABRIC_HUB)
      catch err :: console.error @ err

      const hub = self.MsgFabricTestHub.create('$remote$')

      hub.local.registerTarget @ `tgt_remote`, pkt => ::
        const {id_route, id_target} = pkt
        hub.send @:
          id_route: '$one$', id_target: 'tgt_one',
          body: @{}
            from: 'webworker'
            pkt_hdr: pkt._hdr_
            echo: pkt.json()

      hub.web.connectPostMessage(self)




  function webWorkerRelay(self) ::
    var relay_port
    self.onmessage = init_message

    function init_message(evt) ::
      relay_port = evt.ports[0]
      relay_port.onmessage = recv_message
      self.onmessage = relay_message

    function recv_message(evt) ::
      self.postMessage @ evt.data

    function relay_message(evt) ::
      relay_port.postMessage @ evt.data


  it @ 'hub.web.connectPostMessage is a channel (using relay)', async function() ::
    this.slow(300)

    const url_wkr_relay = asIIFEWebWorkerURL @ webWorkerRelay

    await testDoubleSidedChannelConnection @:
      connect(hub_a, hub_b) ::
        const mc = new MessageChannel()

        const wrk_a = new Worker @ url_wkr_relay
        wrk_a.postMessage @ null, [mc.port1]

        const wrk_b = new Worker @ url_wkr_relay
        wrk_b.postMessage @ null, [mc.port2]

        hub_a.web.connectPostMessage @ wrk_a
        return hub_b.web.connectPostMessage @ wrk_b


  it @ 'validate webWorkerRelay', async function() ::
    this.slow(300)

    const log = newLog()
    const url_wkr_relay = asIIFEWebWorkerURL @ webWorkerRelay

    const mc = new MessageChannel()

    const wrk_a = new Worker @ url_wkr_relay
    wrk_a.postMessage @ null, [mc.port1]
    wrk_a.onmessage = evt => log @ "AAA msg", evt.data

    const wrk_b = new Worker @ url_wkr_relay
    wrk_b.postMessage @ null, [mc.port2]
    wrk_b.onmessage = evt => log @ "BBB msg", evt.data

    expect(log.calls).to.be.empty
    await sleep(100)
    expect(log.calls).to.be.empty

    wrk_a.postMessage @ 'from wkr aaa'

    await sleep(10)
    expect(log.calls).to.deep.equal @#
      @[] 'BBB msg', 'from wkr aaa'

    wrk_b.postMessage @ 'from wkr bbb'

    await sleep(10)
    expect(log.calls).to.deep.equal @#
      @[] 'BBB msg', 'from wkr aaa'
      @[] 'AAA msg', 'from wkr bbb'




export function asIIFEWebWorkerURL(fn) ::
  const src = 'function' === typeof fn
    ? asIIFEString('self', fn)
    : fn+''

  return URL.createObjectURL @
    new Blob @ [src], @{} type: 'application/javascript; charset=utf-8'

export function asIIFEString(...args) ::
  const fn = args.pop()
  return `(${fn.toString()})(${args.join(',')})`


