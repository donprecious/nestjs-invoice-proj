import { Organization } from './organization.entity';
import { User } from './User.entity';
import { BaseEntity } from '../shared/entity/baseEntity';
import { Entity, Column, ManyToOne } from 'typeorm';

@Entity()
export class Invitation extends BaseEntity {
  @ManyToOne(type => Organization)
  organization: Organization;

  @ManyToOne(type => User)
  user: User;

  @ManyToOne(type => User)
  invitedByUser: User;

  @Column()
  confirmationType: string;

  @Column({ nullable: true })
  status: string;
}
