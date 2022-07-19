import chalk from 'chalk'
import { execaNode } from 'execa'
import { existsSync } from 'fs'
import { join } from 'path'
import readline from 'readline'
import { parseArgsStringToArgv } from 'string-argv'
import { resolveCache, resolveRoot } from './fs'
import type { Plugin } from 'esbuild'
import type { Interface } from 'readline'
import { MakkeConfigResolved } from './types'

interface ReplOptions {
  baseDir: string
  reader: Interface
}

const commands = (config: MakkeConfigResolved) => {
  const defaultCommands = [
    'exit',
  ]

  return defaultCommands.concat(config.aliases).sort()
}

const completer = (config: MakkeConfigResolved, line: string) => {
  const completions = commands(config)
  const hits = completions.filter(completion => completion.startsWith(line))

  return [hits.length ? hits : completions, line]
}

const defaultOptions = (config: MakkeConfigResolved) => {
  return {
    baseDir: resolveRoot(),
    reader: readline.createInterface(process.stdin, process.stdout, (line: string) => {
      return completer(config, line)
    }),
  }
}

const isAlias = (config: MakkeConfigResolved, command: string): boolean => {
  return config.aliases.includes(command)
}

const isExit = (command: string): boolean => {
  return command === 'exit'
}

const executor = (config: MakkeConfigResolved, command: string, args: string[] = [], options: ReplOptions) => {
  if (isExit(command)) {
    process.exit()
  }

  if (command) {
    if (isAlias(config, command)) {
      // If the command is an alias, point to the dev build.
      var file = resolveCache('dev.mjs')
    } else {
      var file = join(options.baseDir, command)
    }

    if (existsSync(file)) {
      const childProcess = execaNode(file, args, { stdio: 'inherit' })

      childProcess.on('exit', () => {
        prompt(config, options)
      })
    } else {
      console.warn(chalk.dim('command not found'))

      prompt(config, options)
    }
  } else {
    prompt(config, options)
  }
}

const prompt = (config: MakkeConfigResolved, options: ReplOptions) => {
  options.reader.question('> ', (answer: string) => {
    const [command, ...args] = parseArgsStringToArgv(answer)

    executor(config, command, args, options)
  })
}

const clear = () => {
  const blank = '\n'.repeat(Math.max(0, process.stdout.rows - 2))

  console.log(blank)

  readline.cursorTo(process.stdout, 0, 0)
  readline.clearScreenDown(process.stdout)
}

export const repl = (config: MakkeConfigResolved, replConfig: Partial<ReplOptions> = {}): Plugin => {
  let buildCount = 0
  let startTime = Date.now()
  const options = {
    ...defaultOptions(config),
    ...replConfig,
  }

  return {
    name: 'esbuild:repl',
    async setup({ onEnd, onStart }) {
      onStart(() => {
        clear()
        process.stdin.pause()
        console.log('')

        if (buildCount > 0) {
          console.log(' ', chalk.dim('rebuilding...'))

          startTime = Date.now()
        }
      })

      onEnd(() => {
        console.log(' ', chalk.green('makke dev'), chalk.dim(`ready in ${Date.now() - startTime} ms`))
        console.log('')
        console.log(' ', chalk.dim('commands:', ...commands(config)))
        console.log('')

        process.stdin.setEncoding('utf8')
        process.stdin.resume()

        prompt(config, options)

        buildCount++
      })
    },
  }
}
