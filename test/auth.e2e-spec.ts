import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { AppModule } from '../src/app.module'
import { Role, User } from '../src/modules/users/entities/users.entity'
import { setup, teardown } from '../src/postgres'
import { buildTestApp } from './common'
import * as request from 'supertest'
import { UsersService } from '../src/modules/users/users.service'

describe('Auth', () => {
  let app: INestApplication
  let accessToken: string
  let userService: UsersService

  beforeAll(async () => {
    await setup(async (conn) => {
      const em = conn.createEntityManager()

      const normalUser = em.create(User, {
        email: 'normal@gmail.com',
        password: '1',
        role: Role.user,
      })
      await em.save(normalUser)

      app = await buildTestApp(
        Test.createTestingModule({ imports: [AppModule] }),
      )
    })
    userService = app.get(UsersService)
  })

  afterAll(async () => {
    await teardown()
    await app.close()
  })

  it('app should be definded', () => expect(app).toBeDefined())

  it('should register first user as Admin', () =>
    request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: 'test@gmail.com',
        password: '23',
      })
      .expect(HttpStatus.CREATED)
      .expect(async (res) => {
        expect(res.body).toMatchObject({
          email: 'test@gmail.com',
        })

        const adminUser = await userService.findByEmail(res.body.email)

        expect(adminUser.role).toEqual(Role.admin)
      }))

  it('should register next user as user', () =>
    request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: 'test123@gmail.com',
        password: '23',
      })
      .expect(HttpStatus.CREATED)
      .expect(async (res) => {
        expect(res.body).toMatchObject({
          email: 'test123@gmail.com',
        })

        const normalUser = await userService.findByEmail(res.body.email)

        expect(normalUser.role).toEqual(Role.user)
      }))

  it('should sign in with new user', () =>
    request(app.getHttpServer())
      .post('/auth/signin')
      .send({
        username: 'normal@gmail.com',
        password: '1',
      })
      .expect(HttpStatus.CREATED)
      .expect((res) => {
        expect(res.body.access_token).toBeDefined()
        accessToken = res.body.access_token
      }))

  it('should not sign up with new user with email exist', () =>
    request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        username: 'normal@gmail.com',
        password: '1',
      })
      .expect(HttpStatus.BAD_REQUEST))

  it('should throw unauthenicated without token', () =>
    request(app.getHttpServer())
      .get('/tickets')
      .expect(HttpStatus.UNAUTHORIZED)
      .expect((res) => {
        expect(res.body.message).toMatch('Unauthorized')
      }))

  it('should return OK with token', () => {
    return request(app.getHttpServer())
      .get('/tickets')
      .set('authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK)
  })
})
