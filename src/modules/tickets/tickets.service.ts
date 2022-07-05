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
import { runInTrx } from '../../common'
import { Role, User } from '../users/entities/users.entity'
import { UsersService } from '../users/users.service'
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate'
import { SearchTicketDto } from './dto/search_tickets.dto'
import { resolveIdFromParam } from '../comments/util/check-id'

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
    sortBy: string = 'createdAt',
    type: string = 'ASC',
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

  show(idString: string, user: User) {
    return this.runInTrx(async (repo) => {
      const id = resolveIdFromParam(idString)
      const ticket = await this.findById(id)
      if (ticket.user.id !== user.id && user.role !== Role.admin) {
        throw new ForbiddenException(
          'only admin and the owner can get ticket detail',
        )
      }
      return ticket
    })
  }

  closeTicket(idString: string, user: User): Promise<Ticket> {
    return this.runInTrx(async (repo) => {
      const id = resolveIdFromParam(idString)
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

  resolveTicket(idString: string, user: User): Promise<Ticket> {
    return this.runInTrx(async (repo) => {
      const id = resolveIdFromParam(idString)
      const ticket = await this.findById(id)
      if (ticket.status !== TicketStatus.pending) {
        throw new BadRequestException('you can only resolve the pending ticket')
      }
      if (user.role != Role.admin) {
        throw new ForbiddenException('Only admin resolve ticket')
      }
      return repo.save({ ...ticket, status: TicketStatus.resolved })
    })
  }

  deleteTicket(idString: string, user: User): Promise<any> {
    return this.runInTrx(async (repo) => {
      const id = resolveIdFromParam(idString)
      const ticket = await this.findById(id)
      if (ticket.user.id !== user.id) {
        throw new ForbiddenException(
          'only the ticket owner can delete this ticket',
        )
      }
      return repo.delete(ticket)
    })
  }

  uploadFile(
    idString: string,
    file: Express.Multer.File,
    user: User,
  ): Promise<Ticket> {
    return this.runInTrx(async (repo) => {
      const id = resolveIdFromParam(idString)
      const ticket = await this.findById(id)
      if (ticket.user.id !== user.id) {
        throw new ForbiddenException(
          'only the ticket owner can upload file for this ticket',
        )
      }
      return repo.save({ ...ticket, file: file.originalname })
    })
  }

  deleteFile(idString: string, user: User): Promise<Ticket> {
    return this.runInTrx(async (repo) => {
      const id = resolveIdFromParam(idString)
      const ticket = await this.findById(id)
      if (ticket.user.id !== user.id) {
        throw new ForbiddenException(
          'only the ticket owner can delete file for this ticket',
        )
      }
      return repo.save({ ...ticket, file: '' })
    })
  }

  search({ offset = 0, limit = 2, ...searchDto }: SearchTicketDto): Promise<{
    data: Ticket[]
    pageInfo: {
      total: number
      limit: number
      offset: number
    }
  }> {
    return this.runInTrx(async (repo) => {
      const query = repo
        .createQueryBuilder('ticket')
        .leftJoinAndSelect('ticket.user', 'user')
      if (searchDto.title) {
        query.andWhere('ticket.title ilike :title', {
          title: `%${searchDto.title}%`,
        })
      }
      if (searchDto.email) {
        query.andWhere('user.email = :email', { email: searchDto.email })
      }
      if (searchDto.status) {
        query.andWhere('ticket.status = :status', {
          status: searchDto.status,
        })
      }
      if (searchDto.sortBy) {
        const field = 'ticket.' + searchDto.sortBy
        query.orderBy(field, searchDto.type || 'DESC')
      }

      query.take(limit).offset(offset)

      const [data, total] = await query.getManyAndCount()

      return {
        data,
        pageInfo: {
          total,
          offset,
          limit,
        },
      }
    })
  }

  search2({ offset = 0, limit = 2, ...searchDto }: SearchTicketDto): Promise<{
    data: Ticket[]
    pageInfo: {
      total: number
      limit: number
      offset: number
    }
  }> {
    return this.runInTrx(async (repo) => {
      const query = repo.createQueryBuilder('ticket')
      if (searchDto.email) {
        const user = await repo.manager
          .getRepository(User)
          .createQueryBuilder('user')
          .where({ email: searchDto.email })
          .select(['user.id'])
          .getOne()
        query.andWhere('ticket.userId = :userId', {
          userId: user.id,
        })
      }
      if (searchDto.title) {
        query.andWhere('ticket.title ilike :title', {
          title: `%${searchDto.title}%`,
        })
      }
      if (searchDto.status) {
        query.andWhere('ticket.status = :status', {
          status: searchDto.status,
        })
      }
      if (searchDto.sortBy) {
        const field = 'ticket.' + searchDto.sortBy
        query.orderBy(field, searchDto.type || 'DESC')
      }

      query.take(limit).offset(offset)

      const [data, total] = await query.getManyAndCount()

      return {
        data,
        pageInfo: {
          total,
          offset,
          limit,
        },
      }
    })
  }
}
