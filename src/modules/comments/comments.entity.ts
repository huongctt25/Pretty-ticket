import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm'
import { User } from '../users/entities/users.entity'
import { Ticket } from '../tickets/entities/tickets.entity'
import { AbstractEntity } from 'src/common/base.enity'
import { Expose } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

@Entity()
export class Comment extends AbstractEntity {
  @Expose()
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number

  @Expose()
  @ApiProperty()
  @Column()
  comment: string

  @Expose()
  @ManyToOne(() => User, (user) => user.comments)
  user: User

  @Expose()
  @ManyToOne(() => Ticket, (ticket) => ticket.comments)
  ticket: Ticket
}
