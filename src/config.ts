import { pnpPlugin } from '@yarnpkg/esbuild-plugin-pnp'
import { deepmerge } from 'deepmerge-ts'
import { build } from 'esbuild'
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'fs'
import { CONFIG_FILE_NAME } from './constants'
import { resolveCache, resolveConfig, resolveRoot } from './fs'
import type { MakkeConfig, MakkeConfigResolved } from './types'

const banner = `
  // https://github.com/evanw/esbuild/issues/1921
  import { createRequire as makkeCreateRequire } from "module"

  if (typeof require === "undefined") {
    var require = makkeCreateRequire(import.meta.url)
  }
`

const bundleConfig = async (file: string) => {
  const result = await build({
    absWorkingDir: resolveRoot(),
    banner: {
      js: banner,
    },
    bundle: true,
    entryPoints: [file],
    external: ['makke'],
    format: 'esm',
    metafile: true,
    outfile: 'out.js',
    platform: 'node',
    plugins: [
      // Todo: This might not be necessary in the final build.
      pnpPlugin(),
    ],
    sourcemap: 'inline',
    watch: false, // Todo: watch for changes and rebuild (with a plugin).
    write: false,
  })

  return result.outputFiles[0].text
}

const defaultConfig = (): MakkeConfigResolved => {
  return {
    aliases: [],
    esbuild: {
      bundle: true,
      format: 'esm',
      platform: 'node',
    }
  }
}

const readConfig = async (file: string): Promise<MakkeConfigResolved> => {
  const rawConfig = await bundleConfig(file)
  const tmpFile = resolveCache('makke.config.mjs')

  if (!existsSync(resolveCache())) {
    mkdirSync(resolveCache())
  }

  writeFileSync(resolveCache('.gitignore'), '*')
  writeFileSync(tmpFile, rawConfig)

  try {
    return deepmerge(defaultConfig(), (await import(tmpFile)).default)
  } finally {
    unlinkSync(tmpFile)
  }
}

export const config = async (): Promise<MakkeConfig> => {
  const file = resolveConfig()

  if (!existsSync(file)) {
    throw new Error(`${CONFIG_FILE_NAME} does not exist.`)
  }

  return readConfig(file)
}

export const defineConfig = (config: MakkeConfig): MakkeConfig => {
  return config
}
