import { IsNotEmpty, IsEmail } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  token: string;

  @IsNotEmpty()
  password: string;
}
