import { rm } from '@nubuild/shared'

/**
 * 清除目录
 * @param dir 目标目录
 * @returns 删除成功返回true，否则返回false
 */
export const cleanDir = (dir: string) => rm(dir)
