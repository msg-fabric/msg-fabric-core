import { Hub, expect, newLog } from './_setup'

describe @ 'Plugin direct', @=> ::
  var log, test_chan
  beforeEach @=>> ::
    log = newLog()

  it.skip @ 'todo', @=>> ::