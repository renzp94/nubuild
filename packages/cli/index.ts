#!/usr/bin/env bun
import {
  NUBUILD_NAME,
  NUBUILD_VERSION,
  type NuBuildConfigs,
} from '@nubuild/core'
import { cac } from 'cac'
import { runBuild } from './build'
import { DEFAULT_CONFIG } from './enums'
import { NuBuild } from './nubuild'
import type { CliBuildOptions } from './types'

const cli = cac(NUBUILD_NAME)

cli
  .option('-c, --config <file>', '[string] use specified config file', {
    default: DEFAULT_CONFIG.CONFIG_FILE,
  })
  .option('-m, --mode <mode>', `['development' | 'production'] set env mode`)

cli
  .command('build', 'build for production')
  .option('--outdir <dir>', '[string] output directory (default: dist)', {
    default: DEFAULT_CONFIG.OUTPUT,
  })
  .action(async ({ m, mode, ...options }: CliBuildOptions) => {
    process.env.NODE_ENV = m ?? mode ?? 'production'
    const nubuild = new NuBuild()
    await nubuild.init(options)
    await runBuild(nubuild.configs)
  })

cli.help()
cli.version(NUBUILD_VERSION)
cli.parse()

export const defineConfig = (configs: NuBuildConfigs) => configs
