import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsOptional, IsString } from 'class-validator'

export class SearchTicketDto {
  @IsOptional()
  @IsString()
  title: string

  @IsOptional()
  @IsString()
  status: string

  @IsOptional()
  @IsString()
  email: string

  @IsOptional()
  @IsString()
  sortBy: string

  @IsOptional()
  @IsString()
  type: 'ASC' | 'DESC'

  @IsOptional()
  @IsNumber()
  page: number

  @IsOptional()
  @IsNumber()
  limit: number
}
