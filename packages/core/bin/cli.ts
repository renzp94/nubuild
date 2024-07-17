#!/usr/bin/env bun
import { cac } from 'cac'
import { DEFAULT_CONFIG } from '../enums'
import { NuBuild } from '../nubuild'
import pkg from '../package.json'
import type { CliBuildOptions } from '../types'

const cli = cac(pkg.name)

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
    await nubuild.build()
  })

cli.help()
cli.version(pkg.version)
cli.parse()
