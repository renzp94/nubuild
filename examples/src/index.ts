import { testAdd } from '@/utils/testAdd'

console.log('Hello via Bun!')

const a: number[] = [1, 2, 3]

const b = a.find((v) => v > 5)

export const c = b ?? 1

console.log(c)

testAdd()
