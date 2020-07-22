import { BaseEntity } from './../shared/entity/baseEntity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserOrganization } from './userOrganization.entity';
import { AutoMap } from 'nestjsx-automapper';

@Entity()
export class Organization extends BaseEntity {
  @Column()
  @AutoMap()
  name: string;

  @Column()
  @AutoMap()
  code: string;

  @Column()
  @AutoMap()
  email: string;

  @Column()
  @AutoMap()
  address: string;

  @Column()
  @AutoMap()
  phone: string;

  @Column()
  @AutoMap()
  bankname: string;

  @Column()
  @AutoMap()
  bankNumber: string;

  @Column()
  @AutoMap()
  taxId: string;

  @Column()
  @AutoMap()
  type: string;

  @OneToMany(
    type => UserOrganization,
    userOrganization => userOrganization.user,
  )
  userOrganization: UserOrganization[];
}
