import {builtinModules} from 'module'
import rpi_resolve from '@rollup/plugin-node-resolve'
import rpi_dgnotify from 'rollup-plugin-dgnotify'
import rpi_jsy from 'rollup-plugin-jsy'

const _rpis_ = (defines, ...args) => [
  rpi_jsy({defines}),
  rpi_resolve({ modulesOnly: true }),
  ...args,
  rpi_dgnotify()]

const _cfg_ = {
  external: id => /^node:/.test(id) || builtinModules.includes(id),
  plugins: _rpis_({PLAT_ESM: true}) }


export default [
  ... add_core_jsy('all'),
  ... add_core_jsy('core'),
  ... add_core_jsy('index'),

  ... pi_standard(),
  ... pi_ids(),
  ... pi_cbor(),

  ... pi_direct(),
  ... pi_net(),
  ... pi_web(),

  ... pi_rpc(),
]


function * pi_standard() {
  yield * add_plugin_jsy('standard/all', 'mfpi-standard-all')
  yield * add_plugin_jsy('standard/index', 'mfpi-standard')
}

function * pi_ids() {
  yield * add_plugin_jsy('ids/web', 'mfpi-ids-web')
  yield * add_plugin_jsy('ids/node', 'mfpi-ids-node')
}

function * pi_cbor() {
  yield * add_plugin_jsy('cbor/all', 'mfpi-cbor-all')
  yield * add_plugin_jsy('cbor/index', 'mfpi-cbor')
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




function * add_core_jsy(src_name) {
  yield * _add_jsy('code', src_name, src_name) }

function * add_plugin_jsy(src_name, out_name) {
  yield * _add_jsy('plugins', src_name, out_name) }

function * _add_jsy(src_root, src_name, out_name) {
  yield ({ ... _cfg_, 
    input: `${src_root}/${src_name}.jsy`,
    output: { file: `esm/${out_name}.js`, format: 'es', sourcemap: true }})
}

