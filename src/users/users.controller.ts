import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './users.dto';
import { IUser } from '../interfaces';
import { JwtAuthGuard } from '../auth/auth.guards/access.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAllUsers(): Promise<IUser[]> {
    return await this.usersService.getAllUsers();
  }

  @Get('/allBosses')
  async getAllBosses(): Promise<IUser[]> {
    return await this.usersService.getAllBosses();
  }

  @Put('/:bossId')
  @UseGuards(JwtAuthGuard)
  async chooseBoss(
    @Req() req: any,
    @Param('bossId') bossId: string,
  ): Promise<IUser | string> {
    const user = req.user;
    return await this.usersService.chooseBoss(user, bossId);
  }

  @Put('/:userId/:userToBossId')
  @UseGuards(JwtAuthGuard)
  async updateUserToBoss(
    @Req() req: any,
    @Param('userId') userId: string,
    @Param('userToBossId') userToBossId: string,
  ): Promise<IUser | string> {
    const admin = req.user;
    return await this.usersService.updateUserToBoss(
      userId,
      userToBossId,
      admin,
    );
  }

  @Get('/:userId')
  async getUserById(@Param('userId') userId: string): Promise<IUser> {
    return await this.usersService.getUserById(userId);
  }

  @Post()
  async createUser(@Body() body: CreateUserDto): Promise<IUser> {
    return await this.usersService.createUser(body);
  }

  @Delete('/:userId')
  async deleteUser(@Param('userId') userId: string): Promise<void> {
    return await this.usersService.deleteUser(userId);
  }

  @Put('/:userId')
  async updateUser(
    @Param('userId') userId: string,
    @Body() body: CreateUserDto,
  ) {
    return await this.usersService.updateUser(userId, body);
  }
}
