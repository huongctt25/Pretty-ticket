import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsNotEmpty } from 'class-validator'

export class GetMessagesDto {
  @IsNotEmpty()
  @ApiProperty()
  @IsArray()
  users: number[]
}
