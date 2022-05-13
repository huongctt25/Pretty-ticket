import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm'
import { User } from '../users/entities/users.entity'
import { Ticket } from '../tickets/tickets.entity'

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  comment: string

  @ManyToOne(() => User, (user) => user.comments)
  user: User

  @ManyToOne(() => Ticket, (ticket) => ticket.comments)
  ticket: Ticket
}
