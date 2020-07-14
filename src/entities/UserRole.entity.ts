import { UserOrganization } from './userOrganization.entity';
import { BaseEntity } from '../shared/entity/baseEntity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { Role } from './Role.entity';
import { type } from 'os';
import { User } from './User.entity';

@Entity()
export class UserRole extends BaseEntity {
  @ManyToOne(type => User)
  user: User;

  @ManyToOne(type => Role)
  role: Role;
}
