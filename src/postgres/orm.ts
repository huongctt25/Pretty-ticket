import { Connection, ConnectionOptions, createConnection } from 'typeorm'
import { dbEnv } from './db.env'
import { OrmConfig } from './orm.config'
type MockFunc = (conn: Connection) => Promise<void>
const config = {
  cli: { migrationsDir: './migrations' },
  migrations: ['./migrations/*.ts'],
  ...new OrmConfig(dbEnv()).createTypeOrmOptions(),
  // logging: true,
} as ConnectionOptions

const setup = async (
  mockFn: MockFunc = () => Promise.resolve(),
): Promise<void> => {
  if (config.logging) {
    console.timeLog('J', '~~Setup~~')
  }
  const conn = await createConnection({
    ...config,
    logging: false,
    name: 'setup',
  })
  const qr = conn.createQueryRunner()
  // await qr.dropDatabase(config.database as string, true)
  await qr.createDatabase(config.database as string, true)
  await qr.release()
  await conn.close()
  // config.logging && console.timeLog('J', '~~SETUP Done~~')
  // config.logging && console.timeLog('J', '~~Seeding~~')
  const seedConn = await createConnection({
    ...config,
    logging: false,
    name: 'seed',
  })
  // config.logging && console.timeLog('J', '~~Migrating~~')
  await seedConn.runMigrations()
  // config.logging && console.timeLog('J', '~~MIGRATION Done~~')
  await mockFn(seedConn)
  await seedConn.close()
  config.logging && console.timeLog('J', '~~SEEDING Done~~')
}
const teardown = async (): Promise<void> => {
  config.logging && console.timeLog('J', '~~Teardown~~')
  const conn = await createConnection({
    ...config,
    logging: false,
    name: 'teardown',
  })
  await conn.dropDatabase()
  await conn.close()
  if (config.logging) {
    console.timeLog('J', '~~Done~~')
  }
}
const defaultSeed = async (conn: Connection): Promise<void> => {
  // const em = conn.createEntityManager();
  // use em to seed things
}
export { config, setup, teardown, defaultSeed }
