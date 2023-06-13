import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './bearer.strategy';
import { JwtModule, JwtService } from '@nestjs/jwt';

import * as dotenv from 'dotenv';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenSchema } from '../schemas/token.schema';
dotenv.config();

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Tokens', schema: TokenSchema }]),
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: async () => ({
        secret: process.env.JWT_KEY,
        signOptions: {
          expiresIn: '24h',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtService],
  exports: [AuthService],
})
export class AuthModule {}
