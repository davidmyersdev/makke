import { pnpPlugin } from '@yarnpkg/esbuild-plugin-pnp'
import { readFileSync } from 'fs'
import { defineConfig } from 'makke'

// Importing json files does not work with pnp loader right now.
// https://github.com/yarnpkg/berry/issues/4245
// import { dependencies } from './package.json' assert { type: 'json' }
// @ts-ignore
const { dependencies = {} } = JSON.parse(readFileSync('./package.json').toString())

export default defineConfig({
  esbuild: {
    entryPoints: ['./example.ts'],
    external: Object.keys(dependencies),
    outfile: './example.js',
    plugins: [
      pnpPlugin(),
    ],
    tsconfig: './tsconfig.json',
  },
})
