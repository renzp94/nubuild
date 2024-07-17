import type { BuildConfig } from 'bun'

export interface CliOptions {
  '--'?: string[]
  c: string
  config: string
  m?: 'development' | 'production'
  mode?: 'development' | 'production'
}

export interface CliBuildOptions extends CliOptions {
  outdir: string
}

export type JsTarget =
  | 'es3'
  | 'es5'
  | 'es2015'
  | 'es2016'
  | 'es2017'
  | 'es2018'
  | 'es2019'
  | 'es2020'
  | 'es2021'
  | 'es2022'
  | 'esnext'

export interface NuBuildConfigs extends BuildConfig {
  outdir: string
  mode?: 'development' | 'production'
  clean?: boolean
  jsTarget?: JsTarget
  dst?: boolean
}

export interface CreateBuildOptions extends NuBuildConfigs {
  showOutInfo?: boolean
}
