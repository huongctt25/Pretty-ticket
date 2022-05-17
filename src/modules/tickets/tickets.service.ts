import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { InjectConnection } from '@nestjs/typeorm'
import { Connection, EntityManager, Repository } from 'typeorm'
import { Ticket, TicketStatus } from './entities/tickets.entity'
import { runInTrx } from 'src/common'
import { Role, User } from '../users/entities/users.entity'
import { UsersService } from '../users/users.service'
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate'

@Injectable()
export class TicketsService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private usersService: UsersService,
  ) {}

  private runInTrx<T>(
    run: (repo: Repository<Ticket>) => Promise<T>,
    trx?: EntityManager,
  ): Promise<T> {
    return runInTrx({ connection: this.connection, trx }, (em) =>
      run(em.getRepository(Ticket)),
    )
  }

  async paginate(options: IPaginationOptions): Promise<Pagination<Ticket>> {
    return this.runInTrx(async (repo) => {
      return paginate<Ticket>(repo, options)
    })
  }

  create(title: string, description: string, reqUser: User): Promise<Ticket> {
    return this.runInTrx(async (repo) => {
      const user = await this.usersService.findById(reqUser.id)
      if (!user) {
        throw new BadRequestException('user not found')
      }
      const ticket = repo.create({ title, description, user })

      return repo.save(ticket)
    })
  }

  findUserTickets(
    reqUser: User,
    sortBy: string,
    type: string,
  ): Promise<Ticket[]> {
    return this.runInTrx(async (repo) => {
      let query = repo
        .createQueryBuilder('ticket')
        .leftJoinAndSelect('ticket.user', 'user')
        .where('user.id = :id', { id: reqUser.id })
      if (sortBy !== '') {
        const field = 'ticket.' + sortBy
        query = query.orderBy(field, type === 'DESC' ? 'DESC' : 'ASC')
      }
      const tickets = await query.getMany()

      return tickets
    })
  }

  findById(id: number): Promise<Ticket> {
    return this.runInTrx(async (repo) => {
      const ticket = await repo.findOne({ where: { id }, relations: ['user'] })

      if (!ticket) {
        throw new NotFoundException('Ticket id not found')
      }

      return ticket
    })
  }

  closeTicket(id: number, user: User): Promise<Ticket> {
    return this.runInTrx(async (repo) => {
      const ticket = await this.findById(id)
      if (ticket.user.id != user.id && user.role != Role.admin) {
        throw new ForbiddenException(
          'Only admin and the ticket owner can close ticket',
        )
      }
      if (ticket.status !== TicketStatus.pending) {
        throw new BadRequestException('you can only close the pending ticket')
      }
      ticket.status = TicketStatus.closed
      return repo.save(ticket)
    })
  }

  resolveTicket(id: number, user: User): Promise<Ticket> {
    return this.runInTrx(async (repo) => {
      const ticket = await this.findById(id)
      if (ticket.status !== TicketStatus.pending) {
        throw new BadRequestException('you can only resolve the pending ticket')
      }
      return repo.save({ ...ticket, status: TicketStatus.resolved })
    })
  }

  deleteTicket(id: number, user: User): Promise<any> {
    return this.runInTrx(async (repo) => {
      const ticket = await this.findById(id)
      if (ticket.user.id !== user.id) {
        throw new ForbiddenException(
          'only the ticket owner can delete this ticket',
        )
      }
      return repo.delete(ticket)
    })
  }

  search(title: string, status: string, email: string): Promise<Ticket[]> {
    return this.runInTrx(async (repo) => {
      let query = repo
        .createQueryBuilder('ticket')
        .leftJoinAndSelect('ticket.user', 'user')
      if (title !== '') {
        query = query.where('ticket.title ilike :title', {
          title: `%${title}%`,
        })
      }
      if (email !== '') {
        query = query.where('user.email = :email', { email: email })
      }
      if (status !== '') {
        query = query.where('ticket.status = :status', { status: status })
      }
      const tickets = await query.getMany()

      return tickets
    })
  }
}
