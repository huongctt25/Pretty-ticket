import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class CreateTicketDto {
  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  title: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  description: string
}
