import { resolve } from 'path'
import { CONFIG_FILE_NAME, CACHE_DIRECTORY_NAME } from './constants'

export const resolveCache = (...pathSegments: string[]): string => {
  return resolveRoot(CACHE_DIRECTORY_NAME, ...pathSegments)
}

export const resolveConfig = (): string => {
  return resolveRoot(CONFIG_FILE_NAME)
}

export const resolveRoot = (...pathSegments: string[]): string => {
  // Todo: Optionally resolve root based on location of package.json?
  return resolve(process.cwd(), ...pathSegments)
}
