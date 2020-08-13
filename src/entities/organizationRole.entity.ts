import { Role } from './Role.entity';
import { Organization } from './organization.entity';
import { User } from './User.entity';
import { BaseEntity } from '../shared/entity/baseEntity';
import { Entity, Column, ManyToOne } from 'typeorm';

@Entity()
export class OrganizationRole extends BaseEntity {
  @ManyToOne(
    type => Role,
    role => role.organizationRoles,
  )
  role: Role;

  @ManyToOne(
    type => Organization,
    organization => organization.organizationRoles,
  )
  organization: Organization;
}
