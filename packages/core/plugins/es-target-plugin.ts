import PluginEsTarget, { type SwcOptions } from '@nubuild/bun-plugin-es-target'

export const getEsTargetPlugin = (swc: SwcOptions) => {
  return PluginEsTarget(swc)
}
