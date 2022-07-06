import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm'
import { User } from '../users/entities/users.entity'
import { Ticket } from '../tickets/entities/tickets.entity'
import { Expose } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { AbstractEntity } from '../../common'

@Entity()
export class Chat extends AbstractEntity {
  @Expose()
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number

  @Expose()
  @ApiProperty()
  @Column()
  message: string

  @Expose()
  @ApiProperty()
  @Column()
  from: number

  @Expose()
  @ApiProperty()
  @Column()
  to: number
}
