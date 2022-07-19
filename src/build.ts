import { deepmerge } from 'deepmerge-ts'
import { build as esbuild } from 'esbuild'
import { repl } from './plugin'
import type { BuildOptions } from 'esbuild'
import { resolveCache } from './fs'
import { MakkeConfig } from './types'

const devConfig = (config: MakkeConfig): BuildOptions => {
  return deepmerge(config.esbuild, {
    bundle: true,
    outfile: resolveCache('dev.mjs'),
    plugins: [
      repl(config),
    ],
    watch: true,
  })
}

export const build = async (config: MakkeConfig) => {
  return esbuild(config.esbuild)
}

export const buildDev = async (config: MakkeConfig) => {
  return esbuild(devConfig(config))
}
