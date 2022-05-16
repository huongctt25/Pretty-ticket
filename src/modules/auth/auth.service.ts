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
    const users = await this.usersService.findOne(email)
    if (users.length) {
      throw new BadRequestException('email in use')
    }
    const admin = await this.usersService.findAdmin()
    let role = Role.user
    if (admin.length == 0) {
      role = Role.admin
    }
    const user = await this.usersService.create(email, password, role)
    console.log(user)
    // return the user
    return user
  }

  async login(user: any) {
    const payload = { username: user.email, sub: user.id }
    return {
      access_token: this.jwtService.sign(payload),
    }
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(email)
    if (!user) {
      throw new NotFoundException('user not found')
    }
    // if (user.password != password) {
    //   return new BadRequestException('wrong password')
    // }
    return user
  }
}
