import { Hub, expect, sleep, newLog } from '../_setup'

export default function () ::
  let hub, log
  beforeEach @=> ::
    hub = Hub.create('$unit$')
    log = newLog()
    expect(log.calls).to.be.empty

  it @ 'allows intercepting _send_pkt_ and _recv_pkt_', @=>> ::
    const src = hub.msgs.as @:
      id_route: '$unit$', id_target: 'a_source'

    ::
      const { _send_pkt_, _recv_pkt_ } = src
      src._send_pkt_ = pkt => @ log('src._send_pkt_'), _send_pkt_(pkt)
      src._recv_pkt_ = pkt => @ log('src._recv_pkt_'), _recv_pkt_(pkt)

    hub.local.registerTarget @ 'a_source', async pkt => ::
      expect(pkt.op).to.be.undefined
      await src._recv_pkt_(pkt)
      expect(pkt.op).to.be.an('object')

    const client = hub.msgs
      .as @: id_route: '$unit$', id_target: 'a_client'

    ::
      const { _send_pkt_, _recv_pkt_ } = client
      client._send_pkt_ = pkt => @ log('client._send_pkt_'), _send_pkt_(pkt)
      client._recv_pkt_ = pkt => @ log('client._recv_pkt_'), _recv_pkt_(pkt)

    const c_anon = client
      .to @: id_route: '$unit$', id_target: 'a_source'

    await c_anon.dg_post @: hello: 'salut'

    await sleep(1)
    await expect(log.calls).to.deep.equal @#
      'client._send_pkt_'
      'src._recv_pkt_'


  it @ 'allow extending framings', @=>> ::
    const pi_msgs = hub.msgs.createMsgsPlugin @:
      framing: @{}
        frames({frm, as_op_frame, standard_frames}) ::
          expect(as_op_frame).to.be.a('function')
          expect(standard_frames).to.be.a('function')

          expect(frm._b16_pack).to.be.a('function')
          expect(frm._b16_unpack).to.be.a('function')
          expect(frm._is_defined).to.be.a('function')

          expect(frm).to.have.property('from_route')
          expect(frm).to.have.property('from_target')
          expect(frm).to.have.property('token')
          expect(frm).to.have.property('msgid')
          expect(frm).to.have.property('seq')

          expect(frm.from_route.attr).to.be.a('string')
          expect(frm.from_target.attr).to.be.a('string')
          expect(frm.token.attr).to.be.a('string')
          expect(frm.msgid.attr).to.be.a('string')
          expect(frm.seq.attr).to.be.a('string')

          expect(frm.from_route.pack).to.be.a('function')
          expect(frm.from_target.pack).to.be.a('function')
          expect(frm.token.pack).to.be.a('function')
          expect(frm.msgid.pack).to.be.a('function')
          expect(frm.seq.pack).to.be.a('function')

          expect(frm.from_route.unpack).to.be.a('function')
          expect(frm.from_target.unpack).to.be.a('function')
          expect(frm.token.unpack).to.be.a('function')
          expect(frm.msgid.unpack).to.be.a('function')
          expect(frm.seq.unpack).to.be.a('function')

          log @ 'frames'

          return standard_frames(as_op_frame)

        bind_op_unpack(all_ops, bind_op_unpack) ::
          expect(all_ops).to.be.an('array')
          expect(bind_op_unpack).to.be.an('function')

          const op_unpack = bind_op_unpack @ all_ops
          expect(op_unpack).to.be.an('function')

          log @ 'bind_op_unpack'

          return (pkt, op) => ::
            expect(pkt).to.be.an('object')
            expect(op).to.be.an('object')
            expect(pkt.is_pkt).to.be.true

            const ans = op_unpack(pkt, op)
            log @ 'op_unpack'
              JSON.parse @ JSON.stringify @ pkt._hdr_
              JSON.parse @ JSON.stringify @ op
            return ans

        bind_ops_api(as_ops_api) ::
          expect(as_ops_api).to.be.an('function')

          log @ 'bind_ops_api'
          return ops_list => ::
            expect(ops_list).to.be.an('array')

            log @ 'ops_api'

            for const ea of ops_list ::
              expect(ea.kind).to.be.a('string')
              expect(ea.action).to.be.a('string')
              expect(ea.pack).to.be.a('function')
              expect(ea.unpack).to.be.a('function')
              expect(ea.attrs).to.be.an('array')
              expect(ea.frames).to.be.an('array')

            return as_ops_api(ops_list)

    ::
      expect(log.calls).to.deep.equal @#
        'frames'
        'bind_op_unpack'
        'bind_ops_api'
        'ops_api', 'ops_api', 'ops_api', 'ops_api',

      log.calls = []


    const src = pi_msgs.as @:
      id_route: '$unit$', id_target: 'a_source'

    hub.local.registerTarget @ 'a_source', async pkt => ::
      expect(pkt.op).to.be.undefined
      await src._recv_pkt_(pkt)
      expect(pkt.op).to.be.an('object')

    const c_anon = pi_msgs
      .as @: id_route: '$unit$', id_target: 'a_client'
      .to @: id_route: '$unit$', id_target: 'a_source'

    await c_anon.dg_post @: hello: 'salut'

    await log.expectOneLogOf @
      'op_unpack'
      @[] '$unit$', 'a_source', '@', '$unit$', 'a_client'
      @{} kind: 'datagram'
        from: true, from_route: '$unit$', from_target: 'a_client'
