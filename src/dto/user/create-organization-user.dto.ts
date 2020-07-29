import { invitationStatus } from './../../shared/entity/entityStatus';
import { CreateUserDto } from '../organization/create-user.dto';
import { CreateOrganizationDto } from 'src/dto/organization/create-organization.dto';
import {
  IsNotEmpty,
  IsEmail,
  ValidateNested,
  IsIn,
  IsDefined,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrganizationUserDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateOrganizationDto)
  organization: CreateOrganizationDto;

  @IsDefined()
  @ValidateNested()
  @Type(() => CreateUserDto)
  user: CreateUserDto;
}

export class ConfirmOrganizationWithUserDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateOrganizationDto)
  orgainzation: CreateOrganizationDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateUserDto)
  user: CreateUserDto;
}

export class ConfirmUserDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateUserDto)
  user: CreateUserDto;
}

export class UpdateInvitationStatusDto {
  @IsIn([invitationStatus.accepted, invitationStatus.canceled])
  status: string;
}
