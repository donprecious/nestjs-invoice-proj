import { type } from 'os';
import { OrganizationRole } from './organizationRole.entity';
import { Address } from './../dto/organization/organization.dto';
import { BaseEntity } from './../shared/entity/baseEntity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
// import { UserOrganization } from './userOrganization.entity';
import { AutoMap } from 'nestjsx-automapper';
import { Type } from 'class-transformer';
import { organizationStatus } from 'src/shared/app/organizationStatus';

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

  @Column('simple-json')
  address: Address;

  @Column()
  @AutoMap()
  phone: string;

  @Column()
  @AutoMap()
  bankcode: string;

  @Column()
  @AutoMap()
  bankNumber: string;

  @Column()
  @AutoMap()
  taxId: string;

  @Column()
  @AutoMap()
  type: string;

  @Column({ default: 'active' })
  status: string;

  // @OneToMany(
  //   type => UserOrganization,
  //   userOrganization => userOrganization.user,
  // )
  // userOrganization: UserOrganization[];

  @OneToMany(
    type => OrganizationRole,
    organizationRole => organizationRole.organization,
    { onDelete: 'CASCADE' },
  )
  organizationRoles: OrganizationRole[];
}
