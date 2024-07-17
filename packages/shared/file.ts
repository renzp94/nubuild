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
