import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as dotenv from 'dotenv';
import { Payload } from '../../interfaces/user.interface';
dotenv.config();

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.ACCESS_SECRET,
    });
  }

  async validate(payload: Payload) {
    const user = await this.authService.validateUser(payload);
    if (!user) {
      return new HttpException('Unauthorized access', HttpStatus.UNAUTHORIZED);
    }

    return user;
  }
}