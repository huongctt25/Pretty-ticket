import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm'
import { User } from '../users/entities/users.entity'
import { Comment } from '../comments/comments.entity'

@Entity()
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  title: string

  @Column()
  description: string

  @Column()
  status: string

  @ManyToOne(() => User, (user) => user.tickets)
  user: User

  @OneToMany(() => Comment, (comment) => comment.ticket)
  comments: Comment[]
}
