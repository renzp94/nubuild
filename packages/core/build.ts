import type { DtsBuildArtifact, DtsOptions } from '@nubuild/bun-plugin-dts'
import type { BuildConfig, BuildOutput } from 'bun'
import { DEFAULT_CONFIG } from './enums'
import type { CommonOptions } from './index'
import { getDefaultPlugins } from './plugins'
import { cleanDir, copyDir } from './utils'

export interface BuildOptions extends BuildConfig, CommonOptions {
  clean?: boolean
  dts?: boolean | DtsOptions
}

export interface NuBuildBuildOutput extends BuildOutput {
  time: number
}

/**
 * 打包
 * @param options
 * @returns
 */
export const build = async (
  options: BuildOptions,
): Promise<NuBuildBuildOutput> => {
  const {
    clean,
    dts,
    swc,
    staticDir = DEFAULT_CONFIG.STATIC_DIR,
    outdir = DEFAULT_CONFIG.OUT_DIR,
    ...buildOptions
  } = options
  if (clean && options.outdir) {
    await cleanDir(options.outdir)
  }

  let dtsFiles: DtsBuildArtifact[] = []
  const onDtsEnd = (files: DtsBuildArtifact[]) => {
    dtsFiles = files
  }
  const defaultPlugins = getDefaultPlugins({ dts, swc, onDtsEnd })
  const { plugins = [], ...otherOptions } = buildOptions

  const startTime = Date.now()

  try {
    const result = await Bun.build({
      outdir,
      ...otherOptions,
      plugins: [...defaultPlugins, ...plugins],
    })
    const copyResult = await copyDir(staticDir, outdir)
    const endTime = Date.now()
    const { outputs, ...otherResult } = result
    return {
      ...otherResult,
      outputs: [...outputs, ...dtsFiles, ...copyResult],
      time: endTime - startTime,
    } as any
  } catch (err: any) {
    console.log(err)
    process.exit(1)
  }
}
