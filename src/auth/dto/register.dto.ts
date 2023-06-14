import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RegisterDto {
  name: string;

  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
