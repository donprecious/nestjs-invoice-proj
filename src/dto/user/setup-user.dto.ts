import { IsNotEmpty, IsString } from 'class-validator';

export class SetupUserDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
  @IsNotEmpty()
  otp: number;
  @IsNotEmpty()
  password: string;
}
