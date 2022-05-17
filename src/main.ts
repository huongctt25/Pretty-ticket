import { Logger } from '@nestjs/common'
import { ConfigService, ConfigType } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { appConfig, baseEnv, BASE_ENV } from './configs'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)
  const base = configService.get<ConfigType<typeof baseEnv>>(BASE_ENV)

  appConfig(app)

  const swgBuilder = new DocumentBuilder()
    .setTitle('Pretty Ticket API')
    .setVersion('1.0')
    .addBearerAuth()

  const document = SwaggerModule.createDocument(app, swgBuilder.build())
  SwaggerModule.setup('/api/docs', app, document)

  app.enableShutdownHooks()

  await app.listen(base.port, '0.0.0.0')
  Logger.log(`Running on: ${await app.getUrl()}`)
}
bootstrap()
