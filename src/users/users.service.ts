import { Model } from 'mongoose';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';

import { IUser } from '../interfaces';
import { CreateUserDto } from './users.dto';
import { RegisterDto } from '../auth';
import { ERole } from '../common/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private readonly userModel: Model<IUser>) {}

  // this function allows you to get users, depending on the role of the login user
  async getAllUsers(user: IUser): Promise<IUser[]> {
    if (user.role === ERole.admin) {
      return this.userModel.find();
    } else if (user.role === ERole.boss) {
      return this.userModel.find({
        $or: [{ _id: user._id }, { boss_id: user._id }],
      });
    } else if (user.role === ERole.regular) {
      return this.userModel.find({
        _id: user._id,
      });
    }
  }

  // this function allows regular users to choose their boss when logging in
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
      throw new HttpException(
        { message: 'You have a boss already' },
        HttpStatus.BAD_REQUEST,
      );
    }

    await user.updateOne({ boss_id: bossId });

    return 'User updated';
  }

  // this function allows a boss to bind his subordinates to another boss
  async changeUserBoss(
    bossId: string,
    userId: string,
    user: IUser,
  ): Promise<string> {
    const checkIfLoggedUserIsBoss = await this.userModel
      .find({
        _id: user._id,
        role: ERole.boss,
      })
      .exec();

    if (checkIfLoggedUserIsBoss.length === 0) {
      throw new HttpException(
        { message: 'You are not a boss' },
        HttpStatus.BAD_REQUEST,
      );
    }
    const checkIfBossIdIsBoss = await this.userModel
      .find({
        _id: bossId,
        role: ERole.boss,
      })
      .exec();

    if (checkIfBossIdIsBoss.length === 0) {
      throw new HttpException(
        { message: 'The user you want to make boss for user is not the boss' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const arrayOfSubordinates = await this.userModel
      .find({
        boss_id: user._id,
      })
      .exec();

    if (arrayOfSubordinates.length < 2) {
      throw new HttpException(
        { message: 'You can not give your single subordinate out' },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const findUser = await this.userModel
        .updateOne(
          {
            _id: userId,
            boss_id: user._id,
          },
          {
            boss_id: bossId,
          },
        )
        .exec();
      if (findUser.modifiedCount === 0) {
        return 'This user is not your subordinate or user not found';
      }
    } catch (e) {
      return 'User not found';
    }

    return 'User`s boss was updated';
  }

  // this function allows an admin to change a regular user to a boss
  async updateUserToBoss(
    bossForUserId: string,
    userToBossId: string,
    user: IUser,
  ): Promise<string> {
    if (user.role !== ERole.admin) {
      throw new HttpException(
        { message: 'You are not admin' },
        HttpStatus.BAD_REQUEST,
      );
    }
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
      .updateOne({ _id: userToBossId }, { role: ERole.boss, boss_id: user._id })
      .exec();

    return 'User updated to boss';
  }

  // register users
  async registerUser(body: RegisterDto) {
    const passwordHash = await this.hashPassword(body.password);
    return this.userModel.create({ ...body, password: passwordHash });
  }

  async hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  // this function allows admin to delete users
  async deleteUser(userId: string, user: IUser): Promise<void> {
    if (user.role === ERole.admin) {
      await this.userModel.deleteOne({
        _id: userId,
      });
    } else {
      throw new HttpException(
        { message: 'You are not admin' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // this function allows admin to update users according to any parameters
  async updateUser(
    userId: string,
    body: CreateUserDto,
    user: IUser,
  ): Promise<void> {
    if (user.role === ERole.admin) {
      await this.userModel.updateOne({ _id: userId }, body);
    } else {
      throw new HttpException(
        { message: 'You are not admin' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findEmail(userEmail: string) {
    return this.userModel.findOne({
      email: userEmail,
    });
  }
}
