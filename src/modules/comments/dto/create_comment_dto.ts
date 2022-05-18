import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class CreateCommentDto {
  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  content: string
}
