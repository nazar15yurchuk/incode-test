import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forRoot(process.env.MONGO_DB),
    AuthModule,
  ],
  controllers: [AppController, AuthController],
  providers: [AppService, JwtService, UsersModule],
})
export class AppModule {}
