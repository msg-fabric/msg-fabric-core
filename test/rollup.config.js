import {builtinModules} from 'module'
import rpi_commonjs from '@rollup/plugin-commonjs'
import rpi_resolve from '@rollup/plugin-node-resolve'
import rpi_dgnotify from 'rollup-plugin-dgnotify'
import rpi_jsy from 'rollup-plugin-jsy'

const _rpis_ = (defines, ...args) => [
  rpi_jsy({defines}),
  rpi_resolve({ module: true, main: true }),
  rpi_commonjs({ include: ['./node_modules/**', '../node_modules/**']}),
  ...args,
  rpi_dgnotify()]

const external_node = id => /^node:/.test(id) || builtinModules.includes(id)
const sourcemap = 'inline'

const test_plugins_nodejs = _rpis_({PLAT_NODEJS: true})
const test_plugins_web = _rpis_({PLAT_WEB: true})

export default [

    { input: './browser.hub.js',
      output: {
        file: './_out/__unittest.hub.umd.js',
        format: 'umd', name:'MsgFabricTestHub', sourcemap },
      external: [], plugins: test_plugins_web },

    { input: './unittest.jsy',
      output: {
        file: './_out/__unittest.iife.js',
        format: 'iife', sourcemap },
      external: [], plugins: test_plugins_web },

    { input: './unittest.jsy',
      output: {
        file: './_out/__unittest.cjs.js',
        format: 'cjs', sourcemap },
      external: external_node,
      plugins: test_plugins_nodejs },

]
