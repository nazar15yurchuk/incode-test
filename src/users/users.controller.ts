import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './users.dto';
import { IUser } from '../interfaces';
import { JwtAuthGuard } from '../auth/auth.guards';
import { IRequest } from '../interfaces';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllUsers(@Req() req: IRequest): Promise<IUser[]> {
    const user = req.user;
    return await this.usersService.getAllUsers(user);
  }

  @Put('/:bossId')
  @UseGuards(JwtAuthGuard)
  async chooseBoss(
    @Req() req: IRequest,
    @Param('bossId') bossId: string,
  ): Promise<IUser | string> {
    const user = req.user;
    return await this.usersService.chooseBoss(user, bossId);
  }

  @Put('/:userId/:userToBossId')
  @UseGuards(JwtAuthGuard)
  async updateUserToBoss(
    @Req() req: IRequest,
    @Param('userId') userId: string,
    @Param('userToBossId') userToBossId: string,
  ): Promise<IUser | string> {
    const user = req.user;
    return await this.usersService.updateUserToBoss(userId, userToBossId, user);
  }

  @Put('changeBoss/:bossId/:userId')
  @UseGuards(JwtAuthGuard)
  async changeUserBoss(
    @Req() req: IRequest,
    @Param('bossId') bossId: string,
    @Param('userId') userId: string,
  ): Promise<string> {
    const user = req.user;
    return await this.usersService.changeUserBoss(bossId, userId, user);
  }

  @Delete('/:userId')
  @UseGuards(JwtAuthGuard)
  async deleteUser(
    @Req() req: IRequest,
    @Res() res: any,
    @Param('userId') userId: string,
  ): Promise<void> {
    const user = req.user;
    return res
      .status(204)
      .json(await this.usersService.deleteUser(userId, user));
  }

  @Put('/:userId')
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Req() req: IRequest,
    @Param('userId') userId: string,
    @Body() body: CreateUserDto,
  ): Promise<void> {
    const user = req.user;
    return await this.usersService.updateUser(userId, body, user);
  }
}
