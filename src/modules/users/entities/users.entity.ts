import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { Ticket } from '../../tickets/entities/tickets.entity'
import { Comment } from '../../comments/comments.entity'
import { Expose } from 'class-transformer'
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { AbstractEntity } from 'src/common/base.enity'

export enum Role {
  user = 'user',
  admin = 'admin',
}

@Entity()
export class User extends AbstractEntity {
  @Expose()
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number

  @Column()
  @Expose()
  @ApiProperty()
  email: string

  @Column()
  @ApiHideProperty()
  password: string

  @Expose()
  @ApiProperty()
  @Column({
    type: 'enum',
    enum: Role,
    default: Role.user,
  })
  role: Role

  @OneToMany(() => Ticket, (ticket) => ticket.user)
  tickets: Ticket[]

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[]
}
