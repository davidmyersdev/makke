import { deepmerge } from 'deepmerge-ts'
import { build as esbuild } from 'esbuild'
import { repl } from './plugin'
import type { BuildOptions } from 'esbuild'
import { resolveCache } from './fs'
import { MakkeConfigResolved } from './types'

const devConfig = (config: MakkeConfigResolved): BuildOptions => {
  return deepmerge(config.esbuild, {
    bundle: true,
    outfile: resolveCache('dev.mjs'),
    plugins: [
      repl(config),
    ],
    watch: true,
  })
}

export const build = async (config: MakkeConfigResolved) => {
  return esbuild(config.esbuild)
}

export const buildDev = async (config: MakkeConfigResolved) => {
  return esbuild(devConfig(config))
}
