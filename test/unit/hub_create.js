import { Hub, expect } from './_setup'

describe @ 'Hub creation', @=> ::

  it @ 'new Hub', @=>> :: 
    const hub = new Hub()
    expect @ hub.local.id_route
    .to.be.a('string')

    expect(hub.dispatch).to.be.a @ 'function'
    expect(hub.router.dispatch).to.be.a @ 'function'
    expect(hub.router.dispatch).to.be.equal @ hub.dispatch

    expect(hub.send).to.be.a @ 'function'
    expect(hub.channel.send).to.be.a @ 'function'
    expect(hub.channel.send).to.be.equal @ hub.send

    expect(hub.local.registerTarget).to.be.a @ 'function'
    expect(hub.p2p.registerTarget).to.be.a @ 'function'

  it @ 'Hub.create', @=>> :: 
    const hub = Hub.create()
    expect @ hub.local.id_route
    .to.be.a('string')

    expect(hub.dispatch).to.be.a @ 'function'
    expect(hub.router.dispatch).to.be.a @ 'function'
    expect(hub.router.dispatch).to.be.equal @ hub.dispatch

    expect(hub.send).to.be.a @ 'function'
    expect(hub.channel.send).to.be.a @ 'function'
    expect(hub.channel.send).to.be.equal @ hub.send

    expect(hub.local.registerTarget).to.be.a @ 'function'
    expect(hub.p2p.registerTarget).to.be.a @ 'function'

  it @ 'new Hub with specified id_route', @=>> :: 
    const hub = new Hub('$unit$')
    expect @ hub.local.id_route
    .to.equal @ '$unit$'

  it @ 'Hub.create with specified id_route', @=>> :: 
    const hub = Hub.create('$unit$')
    expect @ hub.local.id_route
    .to.equal @ '$unit$'

  it @ 'new Hub with id_prefix', @=>> :: 
    const hub = new Hub @: id_prefix: '$unit$'
    expect(hub.local.id_route)
    .to.satisfy @ sz => sz.startsWith('$unit$')

  it @ 'Hub.create with id_prefix', @=>> :: 
    const hub = Hub.create @: id_prefix: '$unit$'
    expect(hub.local.id_route)
    .to.satisfy @ sz => sz.startsWith('$unit$')

