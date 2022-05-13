import { ConfigModuleOptions, registerAs } from '@nestjs/config'

export const baseEnvConfig: ConfigModuleOptions = {
  envFilePath: process.env.NODE_ENV === 'test' ? ['test.env'] : ['local.env'],
  ignoreEnvFile: process.env.NODE_ENV === 'production',
}

type EnvType = {
  port: number
  inTest: boolean
  host: string
  inDev: boolean
}

export const BASE_ENV = 'base'

export const baseEnv = registerAs(BASE_ENV, (): EnvType => {
  const nodeEnv = process.env['NODE' + '_ENV']
  const inDev = nodeEnv !== 'production' && nodeEnv !== 'prod'
  return {
    inDev,
    host: process.env.API_HOST || '',
    port: parseInt(process.env.PORT) || 3001,
    inTest: process.env.NODE_ENV === 'test',
  }
})
