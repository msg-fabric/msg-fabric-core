import {builtinModules} from 'module'
import rpi_resolve from '@rollup/plugin-node-resolve'
import rpi_dgnotify from 'rollup-plugin-dgnotify'
import rpi_jsy from 'rollup-plugin-jsy'
import { terser as rpi_terser } from 'rollup-plugin-terser'

const _rpis_ = (defines, ...args) => [
  rpi_jsy({defines}),
  rpi_resolve({ modulesOnly: true }),
  ...args,
  rpi_dgnotify()]

const _cfg_ = {
  external: id => /^\w+:/.test(id) || builtinModules.includes(id),
  plugins: _rpis_({PLAT_ESM: true}) }

const _cfg_min_ = process.env.NO_MINIFI ? null :
  { ... _cfg_, plugins: [ ... _cfg_.plugins, rpi_terser() ]}


export default [
  ... add_core_jsy('all', 'all', false),

  ... pi_ids(),
  ... pi_codecs(),
  ... pi_p2p(),

  ... pi_discovery(),

  ... pi_direct(),
  ... pi_net(),
  ... pi_web(),

  ... pi_rpc(),

  [
    ... add_core_jsy('mf/core', 'core', true),
    ... add_core_jsy('mf/mf-json', 'mf-json', true),
    ... add_core_jsy('mf/mf-cbor', 'mf-cbor', true),

    ... add_core_jsy('mf/mf-json-web', 'mf-json-web', true),
    ... add_core_jsy('mf/mf-cbor-web', 'mf-cbor-web', true),
    ... add_core_jsy('mf/mf-json-node', 'mf-json-node', false),
    ... add_core_jsy('mf/mf-cbor-node', 'mf-cbor-node', false),
  ],
].flat(9)


function * pi_p2p() {
  yield * add_plugin_jsy('p2p-basic/all', 'mfpi-p2p-basic-all')
  yield * add_plugin_jsy('p2p-basic/index', 'mfpi-p2p-basic')
}

function * pi_ids() {
  yield * add_plugin_jsy('ids/web', 'mfpi-ids-web')
  yield * add_plugin_jsy('ids/node', 'mfpi-ids-node')
}

function * pi_codecs() {
  yield * add_plugin_jsy('json/all', 'mfpi-json-all')
  yield * add_plugin_jsy('json/index', 'mfpi-json')

  yield * add_plugin_jsy('cbor/all', 'mfpi-cbor-all')
  yield * add_plugin_jsy('cbor/index', 'mfpi-cbor')
}

function * pi_discovery() {
  yield * add_plugin_jsy('discovery/all', 'mfpi-discovery-all')
  yield * add_plugin_jsy('discovery/index', 'mfpi-discovery')
}

function * pi_direct() {
  yield * add_plugin_jsy('direct/all', 'mfpi-direct-all')
  yield * add_plugin_jsy('direct/index', 'mfpi-direct')
}
function * pi_net() {
  yield * add_plugin_jsy('net/all', 'mfpi-net-all')
  yield * add_plugin_jsy('net/index', 'mfpi-net')
  yield * add_plugin_jsy('net/tcp', 'mfpi-net-tcp')
  yield * add_plugin_jsy('net/tls', 'mfpi-net-tls')
  yield * add_plugin_jsy('net/stream', 'mfpi-net-stream')
}
function * pi_web() {
  yield * add_plugin_jsy('web/all', 'mfpi-web-all')
  yield * add_plugin_jsy('web/basic', 'mfpi-web-basic')
  yield * add_plugin_jsy('web/stream', 'mfpi-web-stream')
  yield * add_plugin_jsy('web/index', 'mfpi-web')
}

function * pi_rpc() {
  yield * add_plugin_jsy('rpc/all', 'mfpi-rpc-all')
  yield * add_plugin_jsy('rpc/index', 'mfpi-rpc')
}




function * add_core_jsy(src_name, out_name, minify) {
  yield ({ ... _cfg_, input: `code/${src_name}.jsy`,
    output: { file: `esm/${out_name}.js`, format: 'es', sourcemap: true }})

  if (minify && _cfg_min_)
    yield ({ ... _cfg_min_, input: `code/${src_name}.jsy`,
      output: { file: `esm/${out_name}.min.js`, format: 'es', sourcemap: false }})
}

function * add_plugin_jsy(src_name, out_name) {
  yield ({ ... _cfg_, input: `plugins/${src_name}.jsy`,
    output: { file: `esm/${out_name}.js`, format: 'es', sourcemap: true }})
}

