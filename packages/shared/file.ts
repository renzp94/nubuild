import fs from 'node:fs/promises'
import { resolve } from './path'

/**
 * 删除文件或目录
 * @param file 文件
 * @returns 删除成功返回true，否则返回false
 */
export const rm = async (file: string) => {
  const filepath = resolve(file)
  const isExists = await fs.exists(file)
  if (!isExists) {
    return true
  }
  const fileStat = await fs.stat(filepath)
  try {
    if (fileStat.isFile()) {
      await fs.unlink(filepath)
      return true
    }
    await fs.rmdir(filepath, { recursive: true })
    return true
  } catch (error: any) {
    console.log(error.message)
    return false
  }
}
/**
 * 复制目录文件
 * @param src 目标目录路径
 * @param dest 要复制到的目录路径
 * @returns 返回复制文件的路径数组
 */
export const copy = async (src: string, dest: string) => {
  const stat = await fs.stat(src)
  let files: string[] = []
  if (stat.isDirectory()) {
    files = await fs.readdir(src)
  }

  const filePaths = files.map((file: string) => {
    const srcDir = `${src}/${file}`
    const destDir = `${dest}/${src}/${file}`

    return {
      src: srcDir,
      fullSrc: resolve(srcDir),
      dest: destDir,
      fullDest: resolve(destDir),
    }
  })

  for (const file of filePaths) {
    const fileTarget = Bun.file(file.fullSrc)
    const fileContent = await fileTarget.text()
    await Bun.write(file.fullDest, fileContent)
  }

  return filePaths.map((file) => file.dest)
}
