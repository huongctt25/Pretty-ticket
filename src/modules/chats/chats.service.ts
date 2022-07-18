import { Injectable } from '@nestjs/common'
import { InjectConnection } from '@nestjs/typeorm'
import { Connection, EntityManager, In, Repository } from 'typeorm'
import { runInTrx } from '../../common'
import { Chat } from './chats.entity'
import { CreateChatDto } from './dto/create-chat-dto.dto'
import { GetMessagesDto } from './dto/get-messages-dto.dto'

@Injectable()
export class ChatsService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  private runInTrx<T>(
    run: (repo: Repository<Chat>) => Promise<T>,
    trx?: EntityManager,
  ): Promise<T> {
    return runInTrx({ connection: this.connection, trx }, (em) =>
      run(em.getRepository(Chat)),
    )
  }
  create(createChatDto: CreateChatDto): Promise<any> {
    return this.runInTrx(async (repo) => {
      const chat = repo.create({ ...createChatDto })
      return repo.save(chat)
    })
  }

  getMessages(getMessagesDto: GetMessagesDto): Promise<any> {
    return this.runInTrx(async (repo) => {
      const messages = await repo.find({
        where: {
          from: In(getMessagesDto.users),
          to: In(getMessagesDto.users),
        },
      })
      return messages
    })
  }
}
