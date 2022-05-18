import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { baseEnv } from './configs'
import { dbEnv, OrmConfig } from './postgres'
import { UsersModule } from './modules/users/users.module'
import { AuthModule } from './modules/auth/auth.module'
import { TicketsModule } from './modules/tickets/tickets.module'
import { CommentsModule } from './modules/comments/comments.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      ...baseEnv,
      isGlobal: true,
      load: [baseEnv, dbEnv],
    }),
    TypeOrmModule.forRootAsync({ useClass: OrmConfig }),
    UsersModule,
    AuthModule,
    TicketsModule,
    CommentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
