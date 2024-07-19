import swc, { type Options } from '@swc/core'
import type { BunPlugin } from 'bun'

export type SwcOptions = Options

const PluginEsTarget = (options: SwcOptions): BunPlugin => ({
  name: 'nubuild:es-target',
  setup(build) {
    build.onLoad({ filter: /\.ts$/ }, async (args) => {
      const { code } = await swc.transformFile(args.path, options)
      return { contents: code }
    })
  },
})

export default PluginEsTarget
