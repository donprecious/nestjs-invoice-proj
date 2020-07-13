import { IsNotEmpty, IsEmail } from 'class-validator';
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
}
