import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { IUser } from '../interfaces';
import { RefreshGuard } from './auth.guards';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Post('register')
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @UseGuards(RefreshGuard)
  @Get('refresh')
  refresh(@Req() req: any) {
    const user = req.user as IUser;
    return this.authService.refresh(user);
  }
}
