import { IsArray, IsIn, IsNotEmpty } from 'class-validator';
import { OrganizationTypeEnum } from 'src/shared/app/organizationType';
import { RoleAccessableType } from 'src/shared/entity/entityStatus';

export class GetRoleDto {
  name: string;
  description: string;
  type: string;
  permissions: string[];
}

export class CreateRoleDto {
  @IsNotEmpty()
  name: string;

  description?: string;

  @IsIn([
    OrganizationTypeEnum.Admin,
    OrganizationTypeEnum.Buyer,
    OrganizationTypeEnum.Supplier,
  ])
  type: OrganizationTypeEnum;

  @IsArray()
  permission: string[];

  @IsIn([RoleAccessableType.private, RoleAccessableType.public])
  accessiblilty: RoleAccessableType;

  organizationId?: string;
}
