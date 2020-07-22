import { UserRole } from "./UserRole.entity";
import { BaseEntity } from '../shared/entity/baseEntity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from './User.entity';

@Entity()
export class Role extends BaseEntity {
  @Column({ unique: true })
  Name: string;

  @Column({ nullable: true })
  Description: string;

  @OneToMany(
    type => UserRole,
    userRole => userRole.role,
  )
  userRoles: UserRole[];

  @Column({ type: 'simple-array' })
  permission: string[];
}
