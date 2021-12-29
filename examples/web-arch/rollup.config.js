import rpi_resolve from '@rollup/plugin-node-resolve'

const _cfg_ = {
  external: id => /^\w+:/.test(id),
  plugins: [rpi_resolve()]}


export default [
  ... add('ui_main'),
  ... add('web_worker'),
  ... add('svc_worker', {out:'/'}),
]


function * add(src_name, opt={}) {
  yield { ..._cfg_, input: `${src_name}.js`,
    output: { file: `root/${opt.out || 'esm/'}${src_name}.js`, format: 'es', sourcemap: true }}
}
