import { BaseEntity } from './../shared/entity/baseEntity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserOrganization } from './userOrganization.entity';

@Entity()
export class Organization extends BaseEntity {
  @Column()
  name: string;

  @Column()
  code: string;

  @Column()
  email: string;

  @Column()
  address: string;

  @Column()
  phone: string;

  @Column()
  bankname: string;

  @Column()
  bankNumber: string;

  @Column()
  taxId: string;

  @Column()
  type: string;

  @OneToMany(
    type => UserOrganization,
    userOrganization => userOrganization.user,
  )
  userOrganization: UserOrganization[];
}
