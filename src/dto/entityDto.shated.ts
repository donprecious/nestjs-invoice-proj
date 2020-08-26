import { AutoMap } from 'nestjsx-automapper';
import { Timestamp } from 'typeorm';

export class EntityDto {
  @AutoMap() id: string;

  @AutoMap() createdOn: Timestamp;
}
