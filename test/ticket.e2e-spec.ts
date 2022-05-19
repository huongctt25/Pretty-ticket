import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { AppModule } from '../src/app.module'
import { Role, User } from '../src/modules/users/entities/users.entity'
import { setup, teardown } from '../src/postgres'
import { buildTestApp } from './common'
import * as request from 'supertest'
import { UsersService } from '../src/modules/users/users.service'
import {
  Ticket,
  TicketStatus,
} from '../src/modules/tickets/entities/tickets.entity'
import { Comment } from '../src/modules/comments/comments.entity'
import { TicketsService } from '../src/modules/tickets/tickets.service'
import { CommentsService } from '../src/modules/comments/comments.service'

describe('Tickets', () => {
  let app: INestApplication
  let accessTokenUser: string
  let accessTokenUser2: string
  let accessTokenAdmin: string
  let userService: UsersService
  const user = {
    email: 'normal@gmail.com',
    role: 'user',
  }
  const admin = {
    email: 'admin@gmail.com',
    role: 'admin',
  }
  const ticket = {
    title: 'title 1',
    description: 'CRUD description',
    user: user,
  }
  const ticket2 = {
    title: 'title 2',
    description: 'CRUD description',
    user: user,
  }
  const ticket3 = {
    title: 'title 3',
    description: 'CRUD description',
    user: user,
  }
  const comment = {
    content: 'comment 1',
    user: admin,
  }

  const comment2 = {
    content: 'comment 2',
    user: user,
  }

  beforeAll(async () => {
    await setup(async (conn) => {
      const em = conn.createEntityManager()

      const normalUser = em.create(User, {
        email: 'normal@gmail.com',
        password: '1',
        role: Role.user,
      })
      const normalUser2 = em.create(User, {
        email: 'normal2@gmail.com',
        password: '1',
        role: Role.user,
      })
      const adminUser = em.create(User, {
        email: 'admin@gmail.com',
        password: '1',
        role: Role.admin,
      })
      await em.save(normalUser)
      await em.save(normalUser2)
      await em.save(adminUser)
      const saveTicket1 = em.create(Ticket, {
        title: ticket.title,
        description: ticket.description,
        user: normalUser,
      })
      await em.save(saveTicket1)
      const saveTicket2 = em.create(Ticket, {
        title: ticket2.title,
        description: ticket2.description,
        user: normalUser,
      })
      await em.save(saveTicket2)
      const saveTicket3 = em.create(Ticket, {
        title: ticket3.title,
        description: ticket3.description,
        user: normalUser,
      })
      await em.save(saveTicket3)
      // const comment1 = em.create(Comment, {
      //   content: comment.content,
      //   user: normalUser,
      //   ticket: saveTicket1,
      // })
      // await em.save(comment1)

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

  it('should sign in with user', () =>
    request(app.getHttpServer())
      .post('/auth/signin')
      .send({
        username: 'normal@gmail.com',
        password: '1',
      })
      .expect(HttpStatus.CREATED)
      .expect((res) => {
        expect(res.body.access_token).toBeDefined()
        accessTokenUser = res.body.access_token
      }))

  it('should sign in with user', () =>
    request(app.getHttpServer())
      .post('/auth/signin')
      .send({
        username: 'normal2@gmail.com',
        password: '1',
      })
      .expect(HttpStatus.CREATED)
      .expect((res) => {
        expect(res.body.access_token).toBeDefined()
        accessTokenUser2 = res.body.access_token
      }))

  it('should sign in with admin user', () =>
    request(app.getHttpServer())
      .post('/auth/signin')
      .send({
        username: 'admin@gmail.com',
        password: '1',
      })
      .expect(HttpStatus.CREATED)
      .expect((res) => {
        expect(res.body.access_token).toBeDefined()
        accessTokenAdmin = res.body.access_token
      }))

  it('should create ticket', () => {
    return request(app.getHttpServer())
      .post('/tickets')
      .set('authorization', `Bearer ${accessTokenUser}`)
      .send({
        title: ticket3.title,
        description: ticket3.description,
      })
      .expect(HttpStatus.CREATED)
      .expect((res) => {
        expect(res.body).toMatchObject(ticket3)
      })
  })

  it('should get ticket by ticket owner', () => {
    return request(app.getHttpServer())
      .get('/tickets/1')
      .set('authorization', `Bearer ${accessTokenUser}`)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body).toMatchObject(ticket)
      })
  })

  it('should get ticket by admin', () => {
    return request(app.getHttpServer())
      .get('/tickets/1')
      .set('authorization', `Bearer ${accessTokenAdmin}`)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body).toMatchObject(ticket)
      })
  })

  it('should not get ticket by other people', () => {
    return request(app.getHttpServer())
      .get('/tickets/1')
      .set('authorization', `Bearer ${accessTokenUser2}`)
      .expect(HttpStatus.FORBIDDEN)
      .expect((res) => {
        expect(res.body.message).toMatch(
          'only admin and the owner can get ticket detail',
        )
      })
  })

  it('should not close ticket by other people', () => {
    return request(app.getHttpServer())
      .patch('/tickets/1/close')
      .set('authorization', `Bearer ${accessTokenUser2}`)
      .expect(HttpStatus.FORBIDDEN)
      .expect((res) => {
        expect(res.body.message).toMatch(
          'Only admin and the ticket owner can close ticket',
        )
      })
  })

  it('should close ticket by owner', () => {
    return request(app.getHttpServer())
      .patch('/tickets/1/close')
      .set('authorization', `Bearer ${accessTokenUser}`)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body).toMatchObject(ticket)
        expect(res.body.status).toBe(TicketStatus.closed)
      })
  })

  it('should close ticket by admin', () => {
    return request(app.getHttpServer())
      .patch('/tickets/2/close')
      .set('authorization', `Bearer ${accessTokenAdmin}`)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body).toMatchObject(ticket2)
        expect(res.body.status).toBe(TicketStatus.closed)
      })
  })

  it('should not close ticket when it is not pending', () => {
    return request(app.getHttpServer())
      .patch('/tickets/2/close')
      .set('authorization', `Bearer ${accessTokenAdmin}`)
      .expect(HttpStatus.BAD_REQUEST)
      .expect((res) => {
        expect(res.body.message).toMatch(
          'you can only close the pending ticket',
        )
      })
  })

  it('should not resolve ticket when it is not pending', () => {
    return request(app.getHttpServer())
      .patch('/tickets/2/resolve')
      .set('authorization', `Bearer ${accessTokenAdmin}`)
      .expect(HttpStatus.BAD_REQUEST)
      .expect((res) => {
        expect(res.body.message).toMatch(
          'you can only resolve the pending ticket',
        )
      })
  })

  it('should get tickets of the user', () => {
    return request(app.getHttpServer())
      .get('/tickets?sortBy=createdAt&&type=DESC')
      .set('authorization', `Bearer ${accessTokenUser}`)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body).toHaveLength(4)
        expect(res.body[0]).toMatchObject(ticket3)
      })
  })

  it('should search tickets of the user by admin', () => {
    return request(app.getHttpServer())
      .get('/tickets/search?title=title&status=closed&&sortBy=id&&type=DESC')
      .set('authorization', `Bearer ${accessTokenAdmin}`)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body.data).toHaveLength(2)
        expect(res.body.data[0]).toMatchObject(ticket2)
        // const arr = [ticket2, ticket]
        // expect(res.body.data).toEqual(expect.arrayContaining(arr))
      })
  })

  it('should not search tickets of the user', () => {
    return request(app.getHttpServer())
      .get('/tickets/search?title=title&status=closed&&sortBy=id&&type=DESC')
      .set('authorization', `Bearer ${accessTokenUser2}`)
      .expect(HttpStatus.FORBIDDEN)
      .expect((res) => {
        expect(res.body.message).toBe('Forbidden resource')
      })
  })

  it('should upload file', async () => {
    return request(app.getHttpServer())
      .post('/tickets/1/upload')
      .set('authorization', `Bearer ${accessTokenUser}`)
      .set('Content-Type', 'multipart/form-data')
      .attach('file', './test/file.txt')
      .expect(HttpStatus.CREATED)
      .expect((res) => {
        expect(res.body.file).toBe('file.txt')
      })
  })

  it('should not upload file by other people', async () => {
    return request(app.getHttpServer())
      .post('/tickets/1/upload')
      .set('authorization', `Bearer ${accessTokenUser2}`)
      .set('Content-Type', 'multipart/form-data')
      .attach('file', './test/file.txt')
      .expect(HttpStatus.FORBIDDEN)
      .expect((res) => {
        expect(res.body.message).toMatch(
          'only the ticket owner can upload file for this ticket',
        )
      })
  })

  it('should delete file', async () => {
    return request(app.getHttpServer())
      .delete('/tickets/1/delete_file')
      .set('authorization', `Bearer ${accessTokenUser}`)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body.file).toBe('')
      })
  })

  it('should not delete file by other people', async () => {
    return request(app.getHttpServer())
      .delete('/tickets/1/delete_file')
      .set('authorization', `Bearer ${accessTokenUser2}`)
      .expect(HttpStatus.FORBIDDEN)
      .expect((res) => {
        expect(res.body.message).toMatch(
          'only the ticket owner can delete file for this ticket',
        )
      })
  })

  it('should comment on user ticket by admin', async () => {
    return request(app.getHttpServer())
      .post('/comments/1')
      .set('authorization', `Bearer ${accessTokenAdmin}`)
      .send({
        content: comment.content,
      })
      .expect(HttpStatus.CREATED)
      .expect((res) => {
        expect(res.body).toMatchObject(comment)
      })
  })

  it('should comment on user ticket', async () => {
    return request(app.getHttpServer())
      .post('/comments/1')
      .set('authorization', `Bearer ${accessTokenUser}`)
      .send({
        content: comment2.content,
      })
      .expect(HttpStatus.CREATED)
      .expect((res) => {
        expect(res.body).toMatchObject(comment2)
      })
  })

  it('should not comment on user ticket by other people', async () => {
    return request(app.getHttpServer())
      .post('/comments/1')
      .set('authorization', `Bearer ${accessTokenUser2}`)
      .send({
        content: comment2.content,
      })
      .expect(HttpStatus.FORBIDDEN)
      .expect((res) => {
        expect(res.body.message).toBe('only admin and ticket owner can comment')
      })
  })

  it('should edit comment on user ticket by comment owner', async () => {
    return request(app.getHttpServer())
      .patch('/comments/1')
      .set('authorization', `Bearer ${accessTokenAdmin}`)
      .send({
        content: comment.content,
      })
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body).toMatchObject(comment)
      })
  })

  it('should not edit comment on user ticket by other people', async () => {
    return request(app.getHttpServer())
      .patch('/comments/1')
      .set('authorization', `Bearer ${accessTokenUser2}`)
      .send({
        content: comment.content,
      })
      .expect(HttpStatus.FORBIDDEN)
      .expect((res) => {
        expect(res.body.message).toBe(
          'only comment owner can edit this comment',
        )
      })
  })

  it('should return comments of the ticket when access by admin', () => {
    return request(app.getHttpServer())
      .get('/comments/1?sortBy=id&&type=DESC')
      .set('authorization', `Bearer ${accessTokenAdmin}`)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body).toHaveLength(2)
        expect(res.body[0].content).toBe(comment2.content)
      })
  })

  it('should return comments of the ticket when access by ticket owner', () => {
    return request(app.getHttpServer())
      .get('/comments/1?sortBy=id&&type=DESC')
      .set('authorization', `Bearer ${accessTokenUser}`)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body).toHaveLength(2)
        expect(res.body[0].content).toBe(comment2.content)
      })
  })

  it('should not return comments of the ticket when access by other people', () => {
    return request(app.getHttpServer())
      .get('/comments/1?sortBy=id&&type=DESC')
      .set('authorization', `Bearer ${accessTokenUser2}`)
      .expect(HttpStatus.FORBIDDEN)
      .expect((res) => {
        expect(res.body.message).toBe(
          'only admin and ticket owner can see comments',
        )
      })
  })

  it('should not delete comment by other people', () => {
    return request(app.getHttpServer())
      .delete('/comments/1')
      .set('authorization', `Bearer ${accessTokenUser2}`)
      .expect(HttpStatus.FORBIDDEN)
      .expect((res) => {
        expect(res.body.message).toBe(
          'only the ticket owner can delete this ticket',
        )
      })
  })

  it('should delete comment by comment owner', () => {
    return request(app.getHttpServer())
      .delete('/comments/1')
      .set('authorization', `Bearer ${accessTokenAdmin}`)
      .expect(HttpStatus.NO_CONTENT)
      .expect(async () => {
        const comments = await app
          .get(CommentsService)
          .showTicketComments('1', admin as User)
        expect(comments.find((cmt) => cmt.id === 1)).toBeUndefined()
      })
  })
})
