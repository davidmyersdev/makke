import { cac } from 'cac'
import { build as buildProd, buildDev } from './build'
import { config } from './config'
import { version } from '../package.json' assert { type: 'json' }

const build = async (..._args: any[]) => {
  return buildProd(await config())
}

const dev = async (..._args: any[]) => {
  return buildDev(await config())
}

export const cli = (): void => {
  const definition = cac('makke')

  definition.version(version)
  definition.help()

  definition.command('[options]').action(definition.outputHelp)
  definition.command('build').action(build)
  definition.command('dev').action(dev)

  definition.parse()
}
