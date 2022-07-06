import { Body, Controller, Post } from '@nestjs/common'
import { ChatsService } from './chats.service'
import { CreateChatDto } from './dto/create-chat-dto.dto'
import { GetMessagesDto } from './dto/get-messages-dto.dto'

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatServices: ChatsService) {}
  @Post('/')
  create(@Body() body: CreateChatDto): Promise<Comment> {
    return this.chatServices.create(body)
  }

  @Post('/messages')
  getMessages(@Body() body: GetMessagesDto): Promise<Comment> {
    return this.chatServices.getMessages(body)
  }
}
