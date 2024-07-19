import type { SwcOptions } from '@nubuild/bun-plugin-es-target'
import type { BuildOptions } from './build'
import pkg from './package.json'

export const NUBUILD_NAME = pkg.name
export const NUBUILD_VERSION = pkg.version

export * from './build'

export interface CommonOptions {
  mode?: 'development' | 'production'
  swc?: SwcOptions
}

export interface NuBuildConfigs extends BuildOptions {}
