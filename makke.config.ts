import { pnpPlugin } from '@yarnpkg/esbuild-plugin-pnp'
import { readFileSync } from 'fs'
import { defineConfig } from 'makke'

// Importing json files does not work with pnp loader right now.
// https://github.com/yarnpkg/berry/issues/4245
// import { dependencies } from './package.json' assert { type: 'json' }
// @ts-ignore
const { dependencies = {} } = JSON.parse(readFileSync('./package.json').toString())

const banner = `
  // https://github.com/evanw/esbuild/issues/1921
  import { createRequire as makkeCreateRequire } from "module"

  if (typeof require === "undefined") {
    var require = makkeCreateRequire(import.meta.url)
  }
`

export default defineConfig({
  esbuild: {
    banner: {
      js: banner,
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
    tsconfig: './tsconfig.json',
  },
})
