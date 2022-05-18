import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectConnection } from '@nestjs/typeorm'
import { runInTrx } from 'src/common/base.enity'
import { Connection, EntityManager, Repository } from 'typeorm'
import { Ticket } from '../tickets/entities/tickets.entity'
import { TicketsService } from '../tickets/tickets.service'
import { Role, User } from '../users/entities/users.entity'
import { UsersService } from '../users/users.service'
import { Comment } from './comments.entity'
import { resolveIdFromParam } from './util/check-id'

@Injectable()
export class CommentsService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private usersService: UsersService,
    private ticketService: TicketsService,
  ) {}

  private runInTrx<T>(
    run: (repo: Repository<Comment>) => Promise<T>,
    trx?: EntityManager,
  ): Promise<T> {
    return runInTrx({ connection: this.connection, trx }, (em) =>
      run(em.getRepository(Comment)),
    )
  }

  create(content: string, ticketId: string, reqUser: User): Promise<Comment> {
    return this.runInTrx(async (repo) => {
      if (isNaN(parseInt(ticketId))) {
        throw new BadRequestException('Invalid id')
      }
      const ticket = await this.ticketService.findById(parseInt(ticketId))
      if (!ticket) {
        throw new BadRequestException('ticket not found')
      }
      const user = await this.usersService.findById(reqUser.id)
      if (!user) {
        throw new BadRequestException('user not found')
      }
      if (user.role !== Role.admin && user.id !== ticket.user.id) {
        throw new ForbiddenException('only admin and ticket owner can comment')
      }
      const comment = repo.create({ content, ticket, user })
      return repo.save(comment)
    })
  }

  update(content: string, idString: string, reqUser: User): Promise<Comment> {
    return this.runInTrx(async (repo) => {
      const id = resolveIdFromParam(idString)
      const comment = await repo.findOne({ where: { id }, relations: ['user'] })
      if (!comment) {
        throw new BadRequestException('comment not found')
      }
      if (comment.user.id !== reqUser.id) {
        throw new ForbiddenException('only comment owner can edit this comment')
      }
      return repo.save({ ...comment, content })
    })
  }

  delete(idString: string, user: User): Promise<void> {
    return this.runInTrx(async (repo) => {
      const id = resolveIdFromParam(idString)
      const comment = await repo.findOne({ where: { id }, relations: ['user'] })
      if (!comment) {
        throw new NotFoundException('comment not found')
      }
      if (comment.user.id !== user.id) {
        throw new ForbiddenException(
          'only the ticket owner can delete this ticket',
        )
      }
      await repo.delete(comment.id)
    })
  }

  showTicketComments(
    ticketId: string,
    user: User,
    sortBy: string = 'createdAt',
    type: string = 'ASC',
  ): Promise<Comment[]> {
    return this.runInTrx(async (repo) => {
      const id = resolveIdFromParam(ticketId)
      const ticket = await repo.manager
        .getRepository(Ticket)
        .findOne({ where: { id }, relations: ['user'] })
      if (ticket.id !== user.id && user.role !== Role.admin) {
        throw new ForbiddenException(
          'only admin and ticket owner can see comments',
        )
      }
      const commentsData = await repo.find({
        relations: ['ticket', 'ticket.user'],
        where: {
          ticket: {
            id,
          },
        },
        order: {
          [sortBy]: type === 'ASC' ? 'ASC' : 'DESC',
        },
      })
      return commentsData
    })
  }
}
