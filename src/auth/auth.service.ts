import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { sign } from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { IUser, Payload } from '../interfaces/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IToken } from '../interfaces/tokens.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    @InjectModel('Tokens') private readonly tokenModel: Model<IToken>,
  ) {}

  async compareHash(password: string, hash: string) {
    return bcrypt.compare(password.toString(), hash);
  }

  async signPayload(payload, user: IUser) {
    const access_token = sign(payload, process.env.ACCESS_SECRET, {
      expiresIn: '15m',
    });
    const refresh_token = sign(payload, process.env.REFRESH_TOKEN, {
      expiresIn: '30d',
    });

    await this.tokenModel.create({
      _user_id: user.id,
      access_token,
      refresh_token,
    });
    return { access_token, refresh_token };
  }

  async validateUser(payload: Payload) {
    return await this.usersService.findEmail(payload.email);
  }
}
