import { Organization } from 'src/entities/organization.entity';
import { GetRoleDto } from './../role/role.dto';
import { AutoMap } from 'nestjsx-automapper';
import { EntityDto } from '../entityDto.shated';

export class UserDto extends EntityDto {
  @AutoMap() firstName: string;

  @AutoMap() lastName: string;

  @AutoMap() email: string;

  @AutoMap() phone: string;
  status: string;
  organization: Organization;
  role: GetRoleDto;
}
