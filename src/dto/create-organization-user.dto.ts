import { CreateUserDto } from './create-user.dto';
import { CreateOrganizationDto } from 'src/dto/create-organization.dto';
import { IsNotEmpty, IsEmail, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrganizationUserDto {
  @ValidateNested()
  @Type(() => CreateOrganizationDto)
  orgainzation: CreateOrganizationDto;

  @ValidateNested()
  @Type(() => CreateUserDto)
  user: CreateUserDto;

  createdByOrgId: string;
}
