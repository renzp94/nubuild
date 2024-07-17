import swc, { type JscTarget } from '@swc/core'
import type { BunPlugin } from 'bun'

const PluginEsTarget = (target: JscTarget = 'esnext'): BunPlugin => ({
  name: 'es-target-plugin',
  setup(build) {
    build.onLoad({ filter: /\.ts$/ }, async (args) => {
      const { code } = await swc.transformFile(args.path, { jsc: { target } })
      return { contents: code, loader: 'js' }
    })
  },
})

export default PluginEsTarget
