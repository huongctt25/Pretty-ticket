import { Inject, Injectable } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm'
import { ConnectionOptions } from 'typeorm'
import { Comment } from '../modules/comments/comments.entity'
import { Ticket } from '../modules/tickets/entities/tickets.entity'
import { User } from '../modules/users/entities/users.entity'
import { dbEnv } from './db.env'

const entities = [User, Ticket, Comment]

@Injectable()
export class OrmConfig implements TypeOrmOptionsFactory {
  constructor(
    @Inject(dbEnv.KEY) private readonly env: ConfigType<typeof dbEnv>,
  ) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const baseOptions: TypeOrmModuleOptions = {
      type: 'postgres',
      synchronize: false,
      username: 'pg',
      password: 'pg',
      // logging: ['query'],
    }

    const connectionOption: Partial<ConnectionOptions> = {
      bigNumberStrings: false,
    }

    const testOptions =
      process.env.NODE_ENV === 'test' ? { database: 'test' } : {}
    const ciOptions = process.env.CI === 'true' ? { port: 5432 } : {}
    const migrationOpts =
      process.env.NODE_ENV === 'production'
        ? { migrations: ['./dist/migrations/*.js'] }
        : {}

    const options = {
      ...baseOptions,
      ...connectionOption,
      ...this.env,
      ...testOptions,
      ...ciOptions,
      ...migrationOpts,
      entities,
    }

    return options as TypeOrmModuleOptions
  }
}
