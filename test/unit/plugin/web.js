import { expect, sleep, newLog } from '../_setup'
import { testChannelConnection } from './_chan_tests'

import test_web_worker from './web_worker'

export default function () ::
  describe @ 'MessageChannel and MessagePort', @=> ::
    it @ 'hub.web.connectPostMessage is a channel', @=>> ::
      await testChannelConnection @:
        connect(hub_a, hub_b) ::
          const mc = new MessageChannel()
          hub_a.web.connectPostMessage @ mc.port1
          return hub_b.web.connectPostMessage @ mc.port2

  describe @ 'WebWorker', test_web_worker

  describe @ 'RTCDataChannel', @=> ::
    it @ 'hub.web.connectSend is a channel', async function() ::
      this.slow(200)

      const [rtc_dc_a, rtc_dc_b] = await createRTCTestingDataChannels()

      await testChannelConnection @:
        connect(hub_a, hub_b) ::
          hub_a.web.connectSend @ rtc_dc_a
          return hub_b.web.connectSend @ rtc_dc_b


export async function createRTCTestingDataChannels() ::
  var rtc_dc_src, rtc_dc_dst

  ::
    const rtc_pc = new RTCPeerConnection()

    rtc_dc_src = rtc_pc.createDataChannel('msg-fabric-test')

    const offer = await rtc_pc.createOffer()
    await rtc_pc.setLocalDescription(offer)

    await sleep(10) // same-box RTC connection is currently timing sensitive

    const dst_desc = await init_destination @ rtc_pc.localDescription

    await sleep(10) // same-box RTC connection is currently timing sensitive

    await rtc_pc.setRemoteDescription @ dst_desc

  return @[] await rtc_dc_src, await rtc_dc_dst


  async function init_destination(src_desc) ::
    const rtc_pc = new RTCPeerConnection()

    rtc_dc_dst = new Promise @ resolve => ::
      rtc_pc.ondatachannel = evt => ::
        resolve @ evt.channel

    await rtc_pc.setRemoteDescription @ await src_desc

    const answer = await rtc_pc.createAnswer()
    await rtc_pc.setLocalDescription(answer)

    return rtc_pc.localDescription

