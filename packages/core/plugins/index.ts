import type { DtsBuildArtifact } from '@nubuild/bun-plugin-dts'
import PluginEsTarget from '@nubuild/bun-plugin-es-target'
import type { BuildOptions } from '..'
import { getDtsPlugin } from './dts-plugin'

export const getDefaultPlugins = (
  options: Pick<BuildOptions, 'dts' | 'swc'> & {
    onDtsEnd: (files: DtsBuildArtifact[]) => void
  },
) => {
  const { dts, swc, onDtsEnd } = options

  const defaultPlugins = []
  if (swc) {
    defaultPlugins.push(PluginEsTarget(swc))
  }

  if (dts) {
    const dtsPlugin = getDtsPlugin(dts as Pick<BuildOptions, 'dts'>, onDtsEnd)
    defaultPlugins.push(dtsPlugin)
  }

  return defaultPlugins
}
