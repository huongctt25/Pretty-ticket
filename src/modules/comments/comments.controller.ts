import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  Param,
  Patch,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CommentsService } from './comments.service'
import { CreateCommentDto } from './dto/create_comment_dto'
import { Comment } from './comments.entity'
import { ApiBearerAuth } from '@nestjs/swagger'
import { IsNumber } from 'class-validator'

@Controller('comments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CommentsController {
  constructor(private readonly commentServices: CommentsService) {}

  @Post('/:ticketId')
  create(
    @Request() req,
    @Body() body: CreateCommentDto,
    @Param('ticketId') id: string,
  ): Promise<Comment> {
    return this.commentServices.create(body.content, id, req.user)
  }

  @Patch('/:id')
  update(
    @Request() req,
    @Body() body: CreateCommentDto,
    @Param('id') id: string,
  ): Promise<Comment> {
    return this.commentServices.update(body.content, id, req.user)
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Request() req, @Param('id') id: string): Promise<void> {
    return this.commentServices.delete(id, req.user)
  }

  @Get('/:ticketId')
  showTicketComment(
    @Param('ticketId') id: string,
    @Request() req,
  ): Promise<Comment[]> {
    return this.commentServices.showTicketComments(
      id,
      req.user,
      req.query.sortBy,
      req.query.type,
    )
  }
}
