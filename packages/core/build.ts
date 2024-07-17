import { rm } from '@nubuild/shared'
import { blue, bold, gray, green, red, yellow } from 'kolorist'
import ora from 'ora'
import type { CreateBuildOptions } from './types'

export const createBuild = async (options: CreateBuildOptions) => {
  const { clean, showOutInfo = true, ...buildOptions } = options
  const spinner = ora()
  if (clean) {
    spinner.start(gray(`Cleaning outDir: ${options.outdir}`))
    await rm(options.outdir)
    spinner.succeed(green('Cleaned'))
  }

  try {
    spinner.start('Building...')
    const result = await Bun.build(buildOptions)
    if (result.success) {
      spinner.succeed(green('Builded'))
      if (showOutInfo) {
        console.log(bold(yellow('Output assets: ')))
        for (const item of result.outputs) {
          console.log(blue(`    .${item.path.replace(process.cwd(), '')}`))
        }
      }
    } else {
      spinner.fail(green('Builded'))
      for (const item of result.logs) {
        console.log(red(`    ${item.message}`))
      }
    }
    console.log()
  } catch {
    spinner.fail(red('Builded'))
  }
}
