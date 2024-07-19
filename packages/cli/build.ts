import { type NuBuildConfigs, cleanDir } from '@nubuild/core'
import { blue, bold, gray, green, red, yellow } from 'kolorist'
import ora from 'ora'

/**
 * 打包
 * @param configs 打包配置
 */
export const runBuild = async (configs: NuBuildConfigs) => {
  const { build } = await import('@nubuild/core')
  const { clean, ...options } = configs
  const spinner = ora()
  if (clean && options.outdir) {
    const startTime = Date.now()
    spinner.start(gray(`🧹 Cleaning outdir: ${options.outdir}`))
    await cleanDir(options.outdir)
    const endTime = Date.now()
    spinner.succeed(
      green(`🧹 Clean outdir success in ${endTime - startTime}ms`),
    )
  }

  spinner.start(gray('📦 Building...'))
  const startTime = Date.now()
  try {
    const result = await build({ ...options, clean: false })
    const endTime = Date.now()
    if (result.success) {
      spinner.succeed(green(`📦 Build success in ${endTime - startTime}ms`))
      const outputs = result.outputs.map(
        (item) => `${item.path.replace(`${process.cwd()}/`, '')}`,
      )
      console.log(bold(yellow('Assets: ')))
      for (const item of outputs) {
        console.log(blue(`  ${item}`))
      }
      return
    }
    spinner.fail(red('⚠️ Build error'))
  } catch {
    spinner.fail(red('⚠️ Build error'))
  }
}
