import { AutoMap } from 'nestjsx-automapper';
import { EntityDto } from '../entityDto.shated';

export class UserDto extends EntityDto {
  @AutoMap() firstName: string;

  @AutoMap() lastName: string;

  @AutoMap() email: string;

  @AutoMap() phone: string;

  // organization: organizationDto[];
  // roles: rolesDto[];
}
