import type { DtsBuildArtifact, DtsOptions } from '@nubuild/bun-plugin-dts'
import { rm } from '@nubuild/shared'
import type { BuildConfig, BuildOutput } from 'bun'
import type { CommonOptions } from '.'
import { getDefaultPlugins } from './plugins'

export interface BuildOptions extends BuildConfig, CommonOptions {
  clean?: boolean
  dts?: boolean | DtsOptions
}

export interface NuBuildBuildOutput extends BuildOutput {
  time: number
}

/**
 * 创建
 * @param options
 * @returns
 */
export const build = async (
  options: BuildOptions,
): Promise<NuBuildBuildOutput> => {
  const { clean, dts, swc, ...buildOptions } = options
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
      ...otherOptions,
      plugins: [...defaultPlugins, ...plugins],
    })
    const endTime = Date.now()
    const { outputs, ...otherResult } = result
    return {
      ...otherResult,
      outputs: [...outputs, ...dtsFiles],
      time: endTime - startTime,
    } as any
  } catch (err: any) {
    const endTime = Date.now()
    return {
      outputs: [],
      success: false,
      logs: [err.message],
      time: endTime - startTime,
    }
  }
}

/**
 * 清除目录
 * @param dir 目标目录
 * @returns 删除成功返回true，否则返回false
 */
export const cleanDir = (dir: string) => rm(dir)
