import type { BuildOptions } from 'esbuild'

export interface MakkeConfig {
  aliases?: string[]
  esbuild?: BuildOptions
}

export type MakkeConfigResolved = Required<MakkeConfig>

export function cli(): void
export function defineConfig(config: MakkeConfig): MakkeConfig
