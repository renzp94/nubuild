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
