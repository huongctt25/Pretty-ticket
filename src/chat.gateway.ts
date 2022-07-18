import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  userSockets = new Map()
  @WebSocketServer()
  server

  @SubscribeMessage('connection')
  async handleConnection(
    @ConnectedSocket() socket: Socket,
    @MessageBody() message: any,
  ) {
    if (message?.userid) {
      this.userSockets.set(parseInt(message.userid), socket.id)
    }
    const userIds = []
    this.userSockets.forEach((k, v) => {
      userIds.push(v)
    })
    this.server.emit('online', { userIds })
  }

  @SubscribeMessage('sendmessage')
  handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() message: any,
  ): void {
    console.log(this.userSockets)
    console.log({ message })
    const toUserSocket = this.userSockets.get(message.to)
    if (toUserSocket) {
      this.server.to(toUserSocket).emit('message', message)
    }
    const fromUserSocket = this.userSockets.get(message.from)
    if (fromUserSocket) {
      this.server.to(fromUserSocket).emit('message', message)
    }
  }
}
