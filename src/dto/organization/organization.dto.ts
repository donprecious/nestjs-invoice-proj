import { AutoMap } from 'nestjsx-automapper';
import { EntityDto } from '../entityDto.shated';

export class OrganizationDto extends EntityDto {
  @AutoMap() name: string;

  @AutoMap() code: string;

  @AutoMap() email: string;

  @AutoMap() address: string;

  @AutoMap() phone: string;

  @AutoMap() bankname: string;

  @AutoMap() bankNumber: string;

  @AutoMap() taxId: string;

  @AutoMap() type: string;
}
