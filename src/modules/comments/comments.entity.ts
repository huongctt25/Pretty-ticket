import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm'
import { User } from '../users/entities/users.entity'
import { Ticket } from '../tickets/entities/tickets.entity'
import { Expose } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { AbstractEntity } from '../../common'

@Entity()
export class Comment extends AbstractEntity {
  @Expose()
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number

  @Expose()
  @ApiProperty()
  @Column()
  content: string

  @Expose()
  @ManyToOne(() => User, (user) => user.comments)
  user: User

  @Expose()
  @ManyToOne(() => Ticket, (ticket) => ticket.comments)
  ticket: Ticket
}
