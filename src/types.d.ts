import type { BuildOptions } from 'esbuild'

export interface MakkeConfig {
  aliases: string[]
  esbuild: BuildOptions
}

export function cli(): void
export function defineConfig(config: MakkeConfig): MakkeConfig
