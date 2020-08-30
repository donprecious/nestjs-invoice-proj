import { ManyToOne } from 'typeorm';

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
import { Organization } from './organization.entity';

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

  @Column({ nullable: true })
  accessiblilty: string;

  // @OneToMany(
  //   type => OrganizationRole,
  //   organizationRole => organizationRole.role,
  //   { onDelete: 'CASCADE' },
  // )
  // organizationRoles: OrganizationRole[];

  @Column({ nullable: true })
  organizationId: string;

  @ManyToOne(
    type => Organization,
    organization => organization.roles,
  )
  organization: Organization;

  @OneToMany(
    type => User,
    user => user.role,
  )
  users: User[];
}
