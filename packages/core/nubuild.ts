import path from 'node:path'
import PluginEsTarget from '@nubuild/plugin-es-target'
import PluginDts from 'bun-plugin-dts'
import { DEFAULT_CONFIG } from './enums'
import type { CliBuildOptions, NuBuildConfigs } from './types'

type InitOptions = Omit<CliBuildOptions, 'm' | 'mode'>

export class NuBuild {
  #root: string
  configs: NuBuildConfigs
  constructor() {
    this.#root = process.cwd()
    this.configs = { entrypoints: [] }
  }
  async init(options: InitOptions) {
    const configs = await this.#loadConfigs(options.c)
    this.#mergeConfigs(configs, options)
    this.#registerDefaultPlugins()
  }
  async #loadConfigs(filename: string) {
    const fullPath = path.resolve(this.#root, filename)
    const { default: configs } = await import(fullPath)
    return configs
  }
  #mergeConfigs(configs: NuBuildConfigs, options: InitOptions) {
    const { outdir } = options
    this.configs = { outdir, ...configs }
  }
  #registerDefaultPlugins() {
    const {
      plugins = [],
      jsTarget = DEFAULT_CONFIG.JS_TARGET,
      ...configs
    } = this.configs
    this.configs = {
      ...configs,
      plugins: [...plugins, PluginDts(), PluginEsTarget(jsTarget)],
    }
  }
  async build() {
    const { createBuild } = await import('./build')
    await createBuild(this.configs)
  }
}
