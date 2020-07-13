import { IsNotEmpty, IsString, isString } from 'class-validator';
import { AutoMap } from 'nestjsx-automapper';
import { EntityDto } from '../entityDto.shated';

export class SetupUserDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
  @IsNotEmpty()
  otp: string;
  @IsNotEmpty()
  password: string;
}
