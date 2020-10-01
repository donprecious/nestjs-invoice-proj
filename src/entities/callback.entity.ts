import { BaseEntity } from './../shared/entity/baseEntity';
import { Entity, Column } from 'typeorm';
import { AutoMap } from 'nestjsx-automapper';


@Entity()
export class OkraCallback extends BaseEntity {
  @Column()
  @AutoMap()
  organizationID: string;

  @Column()
  @AutoMap()
  method: string;

  @Column()
  @AutoMap()
  record: string;

  @Column()
  @AutoMap()
  callback_url: string;

  @Column()
  @AutoMap()
  callback_code: string;
}
