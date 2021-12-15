import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from 'rollup-plugin-babel'
import json from '@rollup/plugin-json'
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json'

export default {
  input: 'src/index.js',
  output: [
    {
      file: pkg.rollup.main,
      format: 'cjs'
    },
    {
      file: pkg.rollup.module,
      format: 'es'
    },
    {
      file: pkg.rollup.browser,
      format: 'iife',
      name: pkg.name.replace(/[^a-z][a-z]/gi, str => str[1].toUpperCase())
    }
  ],
  plugins: [
    resolve(),
    json(),
    babel({
      exclude: 'node_modules/**', // only transpile our source code
      plugins: ['@babel/plugin-proposal-class-properties', '@babel/plugin-proposal-private-methods'],
    }),
    commonjs(),
    terser()
  ]
}
