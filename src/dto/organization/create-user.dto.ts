import { statusConstant } from './../../shared/constants/StatusConstant';
import { IsNotEmpty, IsEmail, IsIn } from 'class-validator';
import { AutoMap } from 'nestjsx-automapper';

export class CreateUserDto {
  @IsNotEmpty()
  @AutoMap()
  firstName: string;

  @IsNotEmpty()
  @AutoMap()
  lastName: string;

  @IsEmail()
  @AutoMap()
  email: string;

  @IsNotEmpty()
  @AutoMap()
  phone: string;

  role: string;
}

export class EditUserDto {
  @IsNotEmpty()
  @AutoMap()
  firstName: string;

  @IsNotEmpty()
  @AutoMap()
  lastName: string;

  @IsNotEmpty()
  @AutoMap()
  phone: string;

  role: string;

  @IsIn([statusConstant.active, statusConstant.inactive])
  status: string;
}
