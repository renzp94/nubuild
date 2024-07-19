import path from 'node:path'
import type { NuBuildConfigs } from '@nubuild/core'
import { rm } from '@nubuild/shared'
import { blue, bold, gray, green, red, yellow } from 'kolorist'
import ora from 'ora'
import { runBuild } from './build'
import { DEFAULT_CONFIG } from './enums'
import type { CliBuildOptions } from './types'

type InitOptions = Omit<CliBuildOptions, 'm' | 'mode'>

export class NuBuild {
  #root: string
  configs: NuBuildConfigs
  constructor() {
    this.#root = process.cwd()
    this.configs = { entrypoints: [], outdir: DEFAULT_CONFIG.OUTPUT }
  }
  async init(options: InitOptions) {
    const configs = await this.#loadConfigs(options.c)
    this.#mergeConfigs(configs, options)
  }
  async #loadConfigs(filename: string) {
    const fullPath = path.resolve(this.#root, filename)
    const { default: configs } = await import(fullPath)
    return configs
  }
  #mergeConfigs(configs: NuBuildConfigs, options: InitOptions) {
    const { outdir } = options
    this.configs = Object.assign({}, { outdir }, configs)
  }
}
