import { Hub, expect, newLog, createTestHub, sinon } from './_setup'

describe @ 'P2P Target Router', @=> ::
  it @ 'basics', @=>> :: 
    const hub = Hub.create('$one$')
    expect(hub.p2p.id_route).to.equal('')
    expect(hub.p2p.public_routes).to.deep.equal @# '$one$'

  it @ 'hello via direct', @=>> :: 
    const hub_one = createTestHub @ 'one'
    const hub_two = createTestHub @ 'two'

    const chan = await hub_one.direct @ hub_two
    const peer_info = await chan.peer_info
    expect(peer_info).to.deep.equal @:
      routes: @[] '$two$'


  it @ 'hello_body extra info', @=>> :: 
    const hub_one = createTestHub @ 'one'
    const hub_two = createTestHub @ 'two'

    hub_one.p2p.hello_body.this_is_one = true
    hub_two.p2p.hello_body.this_is_two = true

    const chan = await hub_one.direct @ hub_two
    const peer_info = await chan.peer_info
    expect(peer_info).to.deep.equal @:
      this_is_two: true
      routes: @[] '$two$'


  it @ 'peerChannelDiscovery callbacks', @=>> :: 
    const hub_one = createTestHub @ 'one'
    hub_one.p2p.hello_body.this_is_one = true

    const fake_one = sinon.fake()
    hub_one.p2p.peerChannelDiscovery.push @ fake_one

    const hub_two = createTestHub @ 'two'
    hub_two.p2p.hello_body.this_is_two = true

    const fake_two = sinon.fake()
    hub_two.p2p.peerChannelDiscovery.push @ fake_two

    expect(fake_one.notCalled).to.be.true
    expect(fake_two.notCalled).to.be.true

    const chan = await hub_one.direct @ hub_two
    const peer_info = await chan.peer_info

    expect(fake_one.calledTwice).to.be.true
    expect(fake_one.firstCall.args[0].this_is_two).to.be.true
    expect(fake_one.firstCall.args[1].id_target).to.equal('hello')

    expect(fake_one.secondCall.args[0].this_is_two).to.be.true
    expect(fake_one.secondCall.args[1].id_target).to.equal('olleh')

    expect(fake_two.calledTwice).to.be.true
    expect(fake_two.firstCall.args[0].this_is_one).to.be.true
    expect(fake_two.firstCall.args[1].id_target).to.equal('hello')

    expect(fake_two.secondCall.args[0].this_is_one).to.be.true
    expect(fake_two.secondCall.args[1].id_target).to.equal('olleh')

