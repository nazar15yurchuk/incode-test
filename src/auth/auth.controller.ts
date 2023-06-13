import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @Post('login')
  async login(@Body() body: LoginDto, @Res() res: any) {
    const user = await this.userService.findEmail(body.email);
    if (!user) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: 'Email or password is incorrect' });
    }
    if (await this.authService.compareHash(body.password, user.password)) {
      const payload = {
        email: user.email,
      };
      const token = await this.authService.signPayload(payload, user);

      return res.status(HttpStatus.OK).json({ token });
    }
    return res
      .status(HttpStatus.UNAUTHORIZED)
      .json({ message: 'Email or password is incorrect' });
  }
  @Post('register')
  async register(@Res() res: any, @Body() body: RegisterDto) {
    let findEmail;
    try {
      findEmail = await this.userService.findEmail(body.email);
    } catch (e) {
      throw new Error(e.message);
    }
    if (findEmail) {
      return res
        .status(HttpStatus.FORBIDDEN)
        .json({ message: 'User with this email is already exists' });
    }
    await this.userService.registerUser({
      name: body.name || body.email,
      email: body.email,
      password: body.password,
    });
    return res.status(HttpStatus.CREATED).json('User created');
  }

  // @Post('refresh')
  // async refresh(@Req() req: any) {
  //   try {
  //     const refreshToken = req.get(this.refresh())
  //   } catch (e) {
  //
  //   }
  // }
}
