import path from 'node:path'

/**
 * 获取文件绝对路径
 * @param file 文件路径
 * @param cwd 根目录
 * @returns 返回文件绝对路径
 */
export const resolve = (file: string, cwd = process.cwd()) =>
  path.resolve(cwd, file)
