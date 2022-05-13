import { INestApplication } from '@nestjs/common'

import { TestingModule, TestingModuleBuilder } from '@nestjs/testing'
import * as request from 'supertest'
import { appConfig } from '../../src/configs'

export const buildTestApp = async (
  builder: TestingModuleBuilder,
): Promise<INestApplication> => {
  const module: TestingModule = await builder.compile()
  const app = module.createNestApplication()
  appConfig(app)
  await app.init()

  return app
}

type Args = {
  app: INestApplication
  withAuth?: boolean
}

export const get = (
  route: string,
  { app, withAuth = true }: Args,
): request.Test => {
  const rq = request(app.getHttpServer()).get(route)
  return withAuth ? rq.set('authorization', 'Bearer auth-user') : rq
}

export const post = (
  route: string,
  { app, withAuth = true }: Args,
): request.Test => {
  const rq = request(app.getHttpServer()).post(route)
  return withAuth ? rq.set('authorization', 'Bearer auth-user') : rq
}

export const put = (
  route: string,
  { app, withAuth = true }: Args,
): request.Test => {
  const rq = request(app.getHttpServer()).put(route)
  return withAuth ? rq.set('authorization', 'Bearer auth-user') : rq
}

export const del = (
  route: string,
  { app, withAuth = true }: Args,
): request.Test => {
  const rq = request(app.getHttpServer()).del(route)
  return withAuth ? rq.set('authorization', 'Bearer auth-user') : rq
}
