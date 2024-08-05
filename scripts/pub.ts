import fs from 'node:fs/promises'
import path from 'node:path'
import { gray, green } from 'kolorist'
import ora from 'ora'
import prompts from 'prompts'

type PromptValues = {
  packageInfo: { dir: string; name: string; version: string; pkgPath: string }
  versionType: string
  tag: string
  isRepublish: boolean
}

const getPromptValues = async (): Promise<PromptValues> => {
  const args = Bun.argv

  const root = './packages'

  const isRepublish = !!args.find((item) => item === '--r')
  const dirs = await fs.readdir(root, { recursive: true })
  const packageList = dirs.filter((item) => item.includes('package.json'))
  const packages = []
  for (const item of packageList) {
    const dir = `${root}/${item.replace('/package.json', '')}`

    const pkgPath = path.resolve(process.cwd(), root, item)
    const { default: pkg } = await import(pkgPath)
    packages.push({
      dir,
      name: pkg.name,
      version: pkg.version,
      pkgPath,
    })
  }

  const promptValues = await prompts([
    {
      name: 'packageInfo',
      type: 'select',
      message: gray('请选择要发布的包'),
      choices: packages
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((item) => {
          return {
            title: `${item.name}@${item.version}`,
            value: item,
          }
        }),
    },
    {
      name: 'versionType',
      type: isRepublish ? null : 'select',
      message: gray('请选择发布版本'),
      choices: [
        {
          title: '补丁版本号(patch)',
          value: 'patch',
        },
        {
          title: '次版本号(minor)',
          value: 'minor',
        },
        {
          title: '主版本号(major)',
          value: 'major',
        },
      ],
    },
    {
      name: 'tag',
      type: isRepublish ? null : 'toggle',
      message: gray('是否生成Tag?'),
      initial: false,
      active: '是',
      inactive: '否',
    },
  ])

  return { ...promptValues, isRepublish }
}

const getChangelogs = async ({
  packageInfo,
  versionType,
  tag,
}: Omit<PromptValues, 'isRepublish'>) => {
  const result =
    await Bun.$`cd ${packageInfo.dir} && bunx standard-version --skip.commit --release-as ${versionType} ${tag ? '' : '--skip.tag'}`
  const [oldVersion, newVersion] = (await result.text())
    .replace('✔ bumping version in package.json from ', '')
    .split('\n')[0]
    .split(' to ')

  const file = Bun.file(`${packageInfo.dir}/CHANGELOG.md`)
  const content = await file.text()
  const startStr = `### [${newVersion}]`
  const startIndex = content.indexOf(startStr)
  const endStr = `### [${oldVersion}]`
  const endIndex = content.indexOf(endStr)
  const changelog = content.slice(startIndex, endIndex)
  const [_, ...restLogs] = changelog.split('\n')
  const currentLogs = restLogs
    .filter((log) => {
      return log.includes('*') ? log.includes(`**${packageInfo.name}:**`) : true
    })
    .map((log) => log.replace(` **${packageInfo.name}:**`, ''))

  const hasChange = !!currentLogs.find((log) => log.includes('*'))

  const date = new Date()
  const logTime = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`

  const changelogs = hasChange
    ? `## ${packageInfo.name}@${newVersion} (${logTime})\n${currentLogs.join('\n')}`
    : changelog.replace(`### [${newVersion}]`, '## all packages')
  return { changelogs, newVersion }
}

const writeChangelogs = async (
  changelog: string,
  rootChangelogFilePath: string,
  packageDir: string,
): Promise<void> => {
  let changelogs = changelog
  const rootChangelogFile = Bun.file(rootChangelogFilePath)
  if (await rootChangelogFile.exists()) {
    const oldChangelogs = await rootChangelogFile.text()
    if (!oldChangelogs.includes(changelogs)) {
      changelogs += `\n\n${await rootChangelogFile.text()}`
    }
  }
  Bun.write(rootChangelogFilePath, changelogs)

  await fs.unlink(`${packageDir}/CHANGELOG.md`)
}

const { isRepublish, packageInfo, ...restValues } = await getPromptValues()
const spinner = ora()
let version = packageInfo.version
if (!isRepublish) {
  spinner.start(gray('✍ Write changelog...\n'))
  const { changelogs, newVersion } = await getChangelogs({
    ...restValues,
    packageInfo,
  })
  version = newVersion
  const rootChangelogFilePath = path.resolve(process.cwd(), 'CHANGELOG.md')
  await writeChangelogs(changelogs, rootChangelogFilePath, packageInfo.dir)
  spinner.succeed(green('✍ Write changelog success'))

  spinner.start(gray('📔 git commit...'))
  await Bun.$`git add ${packageInfo.dir} ${rootChangelogFilePath}`
  await Bun.$`git commit -m "release(${packageInfo.name}): publish v${version}"`
  spinner.succeed(green('📔 git commit success'))
}

spinner.start(gray(`📦 public ${packageInfo.name} package...\n`))
await Bun.$`cd ${packageInfo.dir} && npm publish`
spinner.succeed(green(`📦 public ${packageInfo.name} package success`))
