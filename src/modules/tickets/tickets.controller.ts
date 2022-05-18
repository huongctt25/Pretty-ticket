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
import { SearchTicketDto } from './dto/search_tickets.dto'
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
      req.query.sortBy,
      req.query.type,
    )
  }

  @UseGuards(AdminGuard)
  @Get('/search')
  search(@Request() req, @Query() dto: SearchTicketDto): Promise<any> {
    return this.ticketService.search2(dto)
  }

  @Get('/:id')
  getTicket(@Param('id') id: string, @Request() req): Promise<Ticket> {
    return this.ticketService.show(id, req.user)
  }

  @Patch('/:id/close')
  closeTicket(@Request() req, @Param('id') id: string): Promise<Ticket> {
    return this.ticketService.closeTicket(id, req.user)
  }

  @Delete('/:id')
  async deleteTicket(@Request() req, @Param('id') id: string) {
    return this.ticketService.deleteTicket(id, req.user)
  }

  @UseGuards(AdminGuard)
  @Patch('/:id/resolve')
  resolveTicket(@Request() req, @Param('id') id: string): Promise<Ticket> {
    return this.ticketService.resolveTicket(id, req.user)
  }
}
