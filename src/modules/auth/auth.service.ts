import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { UsersService } from '../users/users.service'
import { JwtService } from '@nestjs/jwt'
import { User, Role } from '../users/entities/users.entity'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}
  async signup(email: string, password: string): Promise<User> {
    const userWithSameEmail = await this.usersService.findByEmail(email)
    if (userWithSameEmail) {
      throw new BadRequestException('email in use')
    }
    const admin = await this.usersService.findAdmin()

    const user = await this.usersService.create(
      email,
      password,
      admin.length === 0 ? Role.admin : Role.user,
    )
    return user
  }

  async login(user: any) {
    const payload = { username: user.email, sub: user.id }
    return {
      access_token: this.jwtService.sign(payload),
    }
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email)
    if (!user) {
      throw new NotFoundException('user not found')
    }
    // if (user.password != password) {
    //   return new BadRequestException('wrong password')
    // }
    return user
  }
}
