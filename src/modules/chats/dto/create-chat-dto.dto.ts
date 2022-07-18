import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class CreateChatDto {
  @IsNotEmpty()
  @ApiProperty()
  @IsNumber()
  from: number

  @IsNotEmpty()
  @ApiProperty()
  @IsNumber()
  to: number

  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  message: string
}
