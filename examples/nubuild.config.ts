import { defineConfig } from '@nubuild/cli'

export default defineConfig({
  entrypoints: ['./src/index.ts'],
  clean: true,
  dts: true,
  swc: {
    jsc: { target: 'es2015' },
  },
})
