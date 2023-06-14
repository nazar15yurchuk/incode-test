import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';

import { IUser } from '../interfaces';
import { CreateUserDto } from './users.dto';
import { RegisterDto } from '../auth';
import { ERole } from '../common/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private readonly userModel: Model<IUser>) {}

  async getAllUsers(): Promise<IUser[]> {
    return this.userModel.find();
  }

  async getAllBosses(): Promise<IUser[]> {
    return this.userModel.find({
      role: ERole.boss,
    });
  }

  async getUserById(userId: string): Promise<IUser> {
    return this.userModel.findOne({ _id: userId });
  }

  async chooseBoss(user: IUser, bossId: string): Promise<IUser | string> {
    try {
      const findBoss = await this.userModel
        .find({
          _id: bossId,
          role: ERole.boss,
        })
        .exec();

      if (findBoss.length === 0) {
        return 'This user is not a boss';
      }
    } catch (e) {
      return 'Boss not found';
    }

    if (user.boss_id !== null) {
      return 'You have a boss already';
    }

    await user.updateOne({ boss_id: bossId }).exec();

    return 'User updated';
  }

  async updateUserToBoss(
    bossForUserId: string,
    userToBossId: string,
    admin: IUser,
  ): Promise<string> {
    let bossForUserToBoss;
    try {
      const userToBoss = await this.userModel
        .find({
          _id: userToBossId,
          role: ERole.regular,
        })
        .exec();

      if (userToBoss.length === 0) {
        return 'User not found';
      }

      bossForUserToBoss = userToBoss[0]['boss_id'];
    } catch (e) {
      return 'User not found';
    }

    const usersHaveBoss = await this.userModel
      .find({
        boss_id: bossForUserToBoss,
      })
      .exec();

    if (usersHaveBoss.length === 1) {
      await this.userModel.updateOne(
        {
          _id: bossForUserToBoss,
        },
        {
          role: ERole.regular,
          boss_id: null,
        },
      );
    }

    let previousBossForUserId;
    try {
      const findUserForUpdateBoss = await this.userModel
        .find({
          _id: bossForUserId,
        })
        .exec();

      if (findUserForUpdateBoss.length === 0) {
        return 'User for update not found';
      }

      previousBossForUserId = findUserForUpdateBoss[0]['boss_id'];
    } catch (e) {
      return 'User for update not found';
    }

    const findPreviousBossInUsers = await this.userModel
      .find({
        boss_id: previousBossForUserId,
      })
      .exec();

    if (findPreviousBossInUsers.length === 1) {
      await this.userModel.updateOne(
        {
          _id: previousBossForUserId,
        },
        {
          role: ERole.regular,
          boss_id: null,
        },
      );
    }

    await this.userModel
      .updateOne(
        {
          _id: bossForUserId,
          role: ERole.regular,
        },
        { boss_id: userToBossId },
      )
      .exec();

    await this.userModel
      .updateOne(
        { _id: userToBossId },
        { role: ERole.boss, boss_id: admin._id },
      )
      .exec();

    return 'User updated to boss';
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
