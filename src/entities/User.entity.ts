import { Role } from './Role.entity';
// import { UserRole } from './UserRole.entity';
// import { UserOrganization } from './userOrganization.entity';
import { BaseEntity } from './../shared/entity/baseEntity';
import { Entity, Column, Timestamp, ManyToOne } from 'typeorm';

import { AutoMap } from 'nestjsx-automapper';
import { Organization } from './organization.entity';

@Entity()
export class User extends BaseEntity {
  @Column()
  @AutoMap()
  firstName: string;

  @Column()
  @AutoMap()
  lastName: string;

  @Column({ unique: true })
  @AutoMap()
  email: string;

  @Column({ nullable: true })
  @AutoMap()
  phone: string;

  @Column({ nullable: true })
  @AutoMap()
  passwordHash?: string;

  @Column({ nullable: true })
  otp?: number;

  @Column({ nullable: true })
  otpExpiresIn?: Date;

  @Column({ nullable: true })
  resetPasswordToken?: string;

  @Column({ nullable: true, type: 'timestamp' })
  resetPasswordTokenExpire?: Date;

  @Column({ default: 'active' })
  status: string;

  // @OneToMany(
  //   type => UserOrganization,
  //   userOrganization => userOrganization.user,
  // )
  // userOrganization: UserOrganization[];

  // @OneToMany(
  //   type => UserRole,
  //   userRole => userRole.user,
  // )
  // userRoles: UserRole[];
  @ManyToOne(
    type => Organization,
    organization => organization.users,
    { cascade: true },
  )
  organization: Organization;

  @ManyToOne(
    type => Role,
    role => role.users,
    { cascade: true },
  )
  role: Role;
}
