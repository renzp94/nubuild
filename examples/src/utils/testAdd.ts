import { add } from '@/math/add'

export const testAdd = () => {
  const a = 1
  const b = 2
  const c = add(a, b)
  console.log(c === 3)
}
