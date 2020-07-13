import { UserRole } from './UserRole.entity';
import { UserOrganization } from './userOrganization.entity';
import { BaseEntity } from './../shared/entity/baseEntity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { Role } from './Role.entity';
import { AutoMap } from 'nestjsx-automapper';

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

  @OneToMany(
    type => UserOrganization,
    userOrganization => userOrganization.user,
  )
  userOrganization: UserOrganization[];

  @OneToMany(
    type => UserRole,
    userRole => userRole.user,
  )
  userRoles: UserRole[];
}
