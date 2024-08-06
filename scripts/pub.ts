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
  console.log(
    `cd ${packageInfo.dir} && bunx standard-version --skip.commit --release-as ${versionType} ${tag ? '' : `--tag-prefix ${packageInfo.name}@`}`,
  )
  const result =
    await Bun.$`cd ${packageInfo.dir} && bunx standard-version --skip.commit --release-as ${versionType} --tag-prefix ${tag ? 'v' : `${packageInfo.name}@`}`
  const versionResult = await result.text()
  const [oldVersion, newVersion] = versionResult
    .replace('✔ bumping version in package.json from ', '')
    .split('\n')[0]
    .split(' to ')

  if (!tag) {
    const tagResult = versionResult
      .split('\n')
      .at(-3)
      ?.replace('✔ tagging release ', '')

    await Bun.$`git tag --delete ${tagResult}`
  }

  const file = Bun.file(`${packageInfo.dir}/CHANGELOG.md`)
  const content = await file.text()
  const startStr = `### ${newVersion}`
  const otherStartStr = `### [${newVersion}]`
  let startIndex = content.indexOf(startStr)
  if (startIndex === -1) {
    startIndex = content.indexOf(otherStartStr)
  }
  const endStr = `### ${oldVersion}`
  const otherEndStr = `### [${oldVersion}]`
  let endIndex = content.indexOf(endStr)
  if (endIndex === -1) {
    endIndex = content.indexOf(otherEndStr)
  }
  const changelog = content.slice(startIndex, endIndex)
  const [_, ...restLogs] = changelog.split('\n')
  let currentLogs = restLogs
    .filter((log) => {
      return log.includes('*') ? log.includes(`**${packageInfo.name}:**`) : true
    })
    .map((log) => log.replace(` **${packageInfo.name}:**`, ''))

  let logList: string[] = []
  currentLogs = currentLogs.reduce((prev, curr, index) => {
    if (curr.includes('###')) {
      if (logList.length === 0) {
        logList.push(curr)
        return prev
      }

      const isEmpty = logList.every((item, index) => index === 0 || !item)
      let list = prev
      if (!isEmpty) {
        list = [...list, ...logList]
      }
      logList = [curr]

      return list
    }

    if (logList.length > 0) {
      logList.push(curr)
      const isEmpty = logList.every((item, index) => index === 0 || !item)
      return index === currentLogs.length - 1 && !isEmpty
        ? [...prev, ...logList]
        : prev
    }

    return [...prev, curr]
  }, [] as string[])
  const hasChange = !!currentLogs.find((log) => log.includes('*'))

  const date = new Date()
  const logTime = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`

  const changelogs = hasChange
    ? `## ${packageInfo.name}@${newVersion} (${logTime})\n${currentLogs.join('\n')}`
    : changelog
        .replace(`### ${newVersion}`, '## all packages')
        .replace(`### [${newVersion}]`, '## all packages')

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

// await Bun.$`cd ${packageInfo.dir} && npm publish`
