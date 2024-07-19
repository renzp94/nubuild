import PluginDts, {
  type DtsBuildArtifact,
  type DtsOptions,
} from '@nubuild/bun-plugin-dts'
import { isBoolean, isDef } from '@renzp/utils'
import type { BuildOptions } from '../build'

export const getDtsPlugin = (
  dts: Pick<BuildOptions, 'dts'>,
  onDtsEnd: (files: DtsBuildArtifact[]) => void,
) => {
  let dtsOptions: DtsOptions | undefined = undefined
  if (isDef(dts)) {
    dtsOptions = isBoolean(dts)
      ? dts
        ? {
            onEnd: onDtsEnd,
          }
        : undefined
      : (dts as DtsOptions)
  }

  return PluginDts(dtsOptions)
}
