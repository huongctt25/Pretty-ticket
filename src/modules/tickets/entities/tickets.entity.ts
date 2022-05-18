import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm'
import { User } from '../../users/entities/users.entity'
import { Comment } from '../../comments/comments.entity'
import { Expose } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { AbstractEntity } from 'src/common/base.enity'

export enum TicketStatus {
  pending = 'pending',
  resolved = 'resolved',
  closed = 'closed',
}
@Entity()
export class Ticket extends AbstractEntity {
  @Expose()
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number

  @Expose()
  @ApiProperty()
  @Column()
  title: string

  @Expose()
  @ApiProperty()
  @Column()
  description: string

  @Expose()
  @ApiProperty()
  @Column({ default: '' })
  file: string

  @Expose()
  @ApiProperty()
  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.pending,
  })
  status: TicketStatus

  @Expose()
  @ManyToOne(() => User, (user) => user.tickets)
  user: User

  @Expose()
  @OneToMany(() => Comment, (comment) => comment.ticket)
  comments: Comment[]
}
