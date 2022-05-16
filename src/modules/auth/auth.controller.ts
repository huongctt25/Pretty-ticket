import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthDto } from './dto/auth.dto'
import { AuthGuard } from '@nestjs/passport'
import { LocalAuthGuard } from './local-auth.guard'
import { JwtAuthGuard } from './jwt-auth.guard'
import { User } from '../users/entities/users.entity'
import { ApiTags } from '@nestjs/swagger'
import { SignInDto } from './dto/signin.dto'

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  create(@Body() body: AuthDto): Promise<User> {
    return this.authService.signup(body.email, body.password)
  }

  @UseGuards(LocalAuthGuard)
  @Post('/signin')
  async login(@Request() req, @Body() body: SignInDto) {
    console.log('here')
    return this.authService.login(req.user)
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  getProfile(@Request() req) {
    return req.user
  }
}
