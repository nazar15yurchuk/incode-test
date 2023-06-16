import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersModule } from '../users';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AccessTokenStrategy, RefreshTokenStrategy } from './strategies';

import * as dotenv from 'dotenv';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenSchema } from '../schemas';
dotenv.config();

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([{ name: 'Tokens', schema: TokenSchema }]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [AuthController],
  providers: [
    AccessTokenStrategy,
    RefreshTokenStrategy,
    AuthService,
    JwtService,
  ],
  exports: [AuthModule],
})
export class AuthModule {}
