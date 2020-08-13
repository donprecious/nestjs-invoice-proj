import { OrganizationRole } from './organizationRole.entity';
// import { UserRole } from './UserRole.entity';
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
import { type } from 'os';

@Entity()
export class Role extends BaseEntity {
  @Column({ unique: true })
  Name: string;

  @Column({ nullable: true })
  Description: string;

  @Column({ nullable: true })
  type: string;

  @Column({ type: 'simple-array' })
  permission: string[];

  @OneToMany(
    type => OrganizationRole,
    organizationRole => organizationRole.role,
    { onDelete: 'CASCADE' },
  )
  organizationRoles: OrganizationRole[];

  @OneToMany(
    type => User,
    user => user.role,
  )
  users: User[];
}
