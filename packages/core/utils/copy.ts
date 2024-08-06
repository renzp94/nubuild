import { copy } from '@nubuild/shared'

export const copyDir = async (src: string, dest: string) => {
  const files = await copy(src, dest)

  return files.map((path) => ({
    path,
  }))
}
