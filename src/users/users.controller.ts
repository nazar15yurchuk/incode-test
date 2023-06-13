import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { IUser } from '../interfaces/user.interface';
import { CreateUserDto } from './users.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAllUsers(@Req() req: any, @Res() res: any): Promise<IUser> {
    const user = await this.usersService.getAllUsers();
    return res.status(HttpStatus.OK).json(user);
  }

  @Get('/:userId')
  async getUserById(
    @Req() req: any,
    @Res() res: any,
    @Param('userId') userId: string,
  ): Promise<IUser> {
    const user = await this.usersService.getUserById(userId);

    return res.status(HttpStatus.OK).json(user);
  }

  @Post()
  async createUser(
    @Req() req: any,
    @Res() res: any,
    @Body() body: CreateUserDto,
  ): Promise<IUser> {
    const user = await this.usersService.createUser(body);

    return res.status(HttpStatus.CREATED).json(user);
  }

  @Delete('/:userId')
  async deleteUser(
    @Req() req: any,
    @Res() res: any,
    @Param('userId') userId: string,
  ): Promise<IUser> {
    const user = await this.usersService.deleteUser(userId);

    return res.status(HttpStatus.OK).json(user);
  }

  @Put('/:userId')
  async updateUser(
    @Req() req: any,
    @Res() res: any,
    @Param('userId') userId: string,
    @Body() body: CreateUserDto,
  ) {
    const user = await this.usersService.updateUser(userId, body);

    return res.status(HttpStatus.OK).json(user);
  }
}
