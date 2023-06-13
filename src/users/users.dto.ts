import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsNumber()
  @IsOptional()
  age: number;

  @IsBoolean()
  @IsOptional()
  status: boolean;
}
