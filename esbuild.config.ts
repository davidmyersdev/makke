// Todo: Replace this file with makke.
import { pnpPlugin } from '@yarnpkg/esbuild-plugin-pnp'
import { build } from 'esbuild'
import { readFileSync } from 'fs'

// Importing json files does not work with pnp loader right now.
// https://github.com/yarnpkg/berry/issues/4245
// import { dependencies } from './package.json' assert { type: 'json' }
// @ts-ignore
const { dependencies = {} } = JSON.parse(readFileSync('./package.json').toString())

const banners = [
  // https://github.com/evanw/esbuild/issues/1921
  'import { createRequire } from "module"',
  'const require = createRequire(import.meta.url)',
]

await build({
  banner: {
    js: banners.join('\n') + '\n',
  },
  bundle: true,
  entryPoints: ['./src/index.ts'],
  external: Object.keys(dependencies),
  format: 'esm',
  outfile: './dist/makke.js',
  platform: 'node',
  plugins: [
    pnpPlugin(),
  ],
  target: 'node16',
})
