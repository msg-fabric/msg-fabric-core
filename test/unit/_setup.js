export const sym_sampi = '\u03E0' // 'Ϡ'

var Hub
export { Hub }
export function _init(FabricHub) :: Hub = FabricHub

const chai = require('chai')

import chaiAsPromised from 'chai-as-promised'
chai.use @ chaiAsPromised

export const assert = chai.assert
export const expect = chai.expect

export const sleep = ms =>
  new Promise @ resolve =>
    setTimeout @ resolve, ms

export function newLog() ::
  const _log = []
  const log = (...args) =>
    _log.push @ 1 === args.length
      ? args[0] : args

  log.calls = _log
  return log

export function createTestHub(name, log) ::
  const hub = Hub.create @ `$${name}$`

  if log ::
    hub.local.registerTarget @ `tgt_${name}`
      pkt => log @ `recv [${pkt.id_route} ${pkt.id_target}]`

  expect(hub.p2p.public_routes)
  .to.deep.equal @# `$${name}$`

  return hub
