import { BadRequestException } from '@nestjs/common'

export const resolveIdFromParam = (id: string): number => {
  if (isNaN(parseInt(id))) {
    throw new BadRequestException('Invalid id')
  }
  return parseInt(id)
}
