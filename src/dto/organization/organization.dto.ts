import { AutoMap } from 'nestjsx-automapper';
import { EntityDto } from '../entityDto.shated';

export class OrganizationDto extends EntityDto {
  @AutoMap() name: string;

  @AutoMap() code: string;

  @AutoMap() email: string;

  @AutoMap() address: Address;

  @AutoMap() phone: string;

  @AutoMap() bankcode: string;
  @AutoMap() bankName: string;

  @AutoMap() bankNumber: string;

  @AutoMap() taxId: string;

  @AutoMap() type: string;

  @AutoMap() status: string;
}

export class OrganizationPayloadDto {
  id: string;
  @AutoMap() name: string; 
  

  @AutoMap() code: string;

  @AutoMap() email: string;

  @AutoMap() address: Address;

  @AutoMap() phone: string;

  @AutoMap() taxId: string;

  bankcode: string;

  bankNumber: string;
  @AutoMap() type: string;
}

export interface Address {
  streetname: string;
  city: string;
  state: string;
  country: string;
}

export class OrganizationFilter {
  search?: string;
}
