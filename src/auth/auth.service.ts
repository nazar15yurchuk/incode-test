import { Model } from 'mongoose';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { sign } from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

import { IUser, Payload } from '../interfaces';
import { UsersService } from '../users';
import { IToken } from '../interfaces';
import { LoginDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    @InjectModel('Tokens') private readonly tokenModel: Model<IToken>,
  ) {}

  // login user
  async login(body: LoginDto) {
    const user = await this.usersService.findEmail(body.email);
    if (!user) {
      throw new HttpException(
        'Email or password is incorrect',
        HttpStatus.UNAUTHORIZED,
      );
    }
    if (await this.compareHash(body.password, user.password)) {
      const payload = {
        email: user.email,
      };
      const tokens = await this.signTokens(payload, user);

      return { tokens };
    }
    throw new HttpException(
      'Email or password is incorrect',
      HttpStatus.UNAUTHORIZED,
    );
  }

  // register user
  async register(body: RegisterDto) {
    let findEmail;
    try {
      findEmail = await this.usersService.findEmail(body.email);
    } catch (e) {
      throw new Error(e.message);
    }
    if (findEmail) {
      throw new HttpException(
        'User with this email is already exists',
        HttpStatus.FORBIDDEN,
      );
    }
    await this.usersService.registerUser({
      name: body.name || body.email,
      email: body.email,
      password: body.password,
    });
    return 'User created';
  }

  // register jwt tokens
  async signTokens(payload, user: IUser) {
    const access_token = sign(payload, process.env.ACCESS_SECRET, {
      expiresIn: '15m',
    });
    const refresh_token = sign(payload, process.env.REFRESH_TOKEN, {
      expiresIn: '7d',
    });

    await this.tokenModel.create({
      _user_id: user.id,
      access_token,
      refresh_token,
    });
    return { access_token, refresh_token };
  }

  // compare password
  async compareHash(password: string, hash: string) {
    return bcrypt.compare(password.toString(), hash);
  }

  async validateUser(payload: Payload) {
    return await this.usersService.findEmail(payload.email);
  }

  // refresh
  async refresh(user: IUser) {
    const tokens = await this.signTokens(
      {
        id: user._id,
        email: user.email,
      },
      user,
    );
    return { ...tokens };
  }
}
