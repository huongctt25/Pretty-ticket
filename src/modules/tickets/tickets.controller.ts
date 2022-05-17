import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Param,
  Patch,
  Delete,
  UnauthorizedException,
  Query,
  ForbiddenException,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common'
import { AdminGuard } from 'src/guards/admin.guard'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Role } from '../users/entities/users.entity'
import { CreateTicketDto } from './dto/create_ticket.dto'
import { Ticket } from './entities/tickets.entity'
import { TicketsService } from './tickets.service'

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private readonly ticketService: TicketsService) {}

  @Post()
  create(@Request() req, @Body() body: CreateTicketDto): Promise<Ticket> {
    return this.ticketService.create(body.title, body.description, req.user)
  }

  @Get()
  getUserTickets(@Request() req): Promise<Ticket[]> {
    return this.ticketService.findUserTickets(
      req.user,
      req.query.sortBy || 'createdAt',
      req.query.type || '',
    )
  }

  @UseGuards(AdminGuard)
  @Get('/search')
  search(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ): Promise<Ticket[]> {
    limit = limit > 100 ? 100 : limit
    return this.ticketService.search(
      req.query.title || '',
      req.query.status || '',
      req.query.email || '',
    )
  }

  @Get('/:id')
  async getTicket(@Param('id') id: string, @Request() req): Promise<Ticket> {
    const ticket = await this.ticketService.findById(parseInt(id))
    console.log(req.user)
    if (ticket.user.id !== req.user.id && req.user.role !== Role.admin) {
      throw new ForbiddenException(
        'only admin and the owner can get ticket detail',
      )
    }
    return ticket
  }

  @Patch('/:id/close')
  closeTicket(@Request() req, @Param('id') id: string): Promise<Ticket> {
    return this.ticketService.closeTicket(parseInt(id), req.user)
  }

  @Delete('/:id')
  async deleteTicket(@Request() req, @Param('id') id: string) {
    return this.ticketService.deleteTicket(parseInt(id), req.user)
  }

  @UseGuards(AdminGuard)
  @Patch('/:id/resolve')
  resolveTicket(@Request() req, @Param('id') id: string): Promise<Ticket> {
    return this.ticketService.resolveTicket(parseInt(id), req.user)
  }
}
