import { registerAs } from '@nestjs/config'

type DBEnvType = {
  username?: string
  password?: string
  database?: string
  port?: string
  host?: string
  ssl: boolean
}

export const dbEnv = registerAs(
  'db',
  (): DBEnvType =>
    JSON.parse(
      JSON.stringify({
        username: process.env.PG_USER || undefined,
        password: process.env.PG_PASSWORD || undefined,
        database: process.env.PG_DATABASE || undefined,
        port: process.env.PG_PORT || undefined,
        host: process.env.PG_HOST || undefined,
        ssl: process.env.PG_SSL === 'true',
      }),
    ),
)
