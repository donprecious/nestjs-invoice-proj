import { GetRoleDto } from './../../dto/role/role.dto';
import { OrganizationPayloadDto } from './../../dto/organization/organization.dto';


export class JwtPayloadDto{
  userId: string;
  sub: string;
  email: string;
  firstname: string; 
  lastname: string; 
  organization: OrganizationPayloadDto;
  role: GetRoleDto[];
} 