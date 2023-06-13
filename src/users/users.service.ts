import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';

import { IUser } from '../interfaces/user.interface';
import { CreateUserDto } from './users.dto';
import { RegisterDto } from '../auth/dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private readonly userModel: Model<IUser>) {}

  async getAllUsers(): Promise<IUser[]> {
    return this.userModel.find();
  }

  async getUserById(userId: string): Promise<IUser> {
    return this.userModel.findOne({ _id: userId });
  }

  async createUser(body: CreateUserDto) {
    return this.userModel.create({ ...body });
  }

  async registerUser(body: RegisterDto) {
    const passwordHash = await this.hashPassword(body.password);
    return this.userModel.create({ ...body, password: passwordHash });
  }

  async hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  async deleteUser(userId: string) {
    await this.userModel.deleteOne({
      _id: userId,
    });
  }

  async updateUser(userId: string, body: CreateUserDto) {
    await this.userModel.updateOne({ _id: userId }, body);
  }

  async findEmail(userEmail: string) {
    return this.userModel.findOne({
      email: userEmail,
    });
  }
}
