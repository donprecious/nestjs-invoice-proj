import { type } from 'os';

import { Address } from './../dto/organization/organization.dto';
import { BaseEntity } from './../shared/entity/baseEntity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
// import { UserOrganization } from './userOrganization.entity';
import { AutoMap } from 'nestjsx-automapper';
import { Type } from 'class-transformer';
import { organizationStatus } from 'src/shared/app/organizationStatus';
import { User } from './User.entity';
import { Role } from './Role.entity';

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

  @Column({ nullable: true })
  @AutoMap()
  bankcode: string;

  @Column({ nullable: true })
  @AutoMap()
  bankName: string;

  @Column({ nullable: true })
  @AutoMap()
  bankNumber: string;

  @Column()
  @AutoMap()
  taxId: string;

  @Column()
  @AutoMap()
  type: string;

  @Column({ default: 'inactive' })
  status: string;

  @Column({ nullable: true, type: 'decimal', precision: 5, scale: 2 })
  apr: number;

  @Column({ nullable: true })
  parentId: string;

  @OneToMany(
    type => Role,
    role => role.organization,
  )
  roles: Role[];

  @OneToMany(
    type => User,
    user => user.organization,
  )
  users: User[];
}
