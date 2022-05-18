import { Module } from '@nestjs/common'
import { TicketsModule } from '../tickets/tickets.module'
import { UsersModule } from '../users/users.module'
import { CommentsController } from './comments.controller'
import { CommentsService } from './comments.service'

@Module({
  imports: [UsersModule, TicketsModule],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
