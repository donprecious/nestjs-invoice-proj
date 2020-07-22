import { Organization } from './organization.entity';
import { User } from './User.entity';
import { BaseEntity } from '../shared/entity/baseEntity';
import { Entity, Column, ManyToOne } from 'typeorm';

@Entity()
export class OrganizationInvite extends BaseEntity {
  @ManyToOne(
    type => Organization,
    organization => organization.userOrganization,
  )
  invitedByOrganization: Organization;

  @ManyToOne(
    type => Organization,
    organization => organization.userOrganization,
  )
  inviteeOrganization: Organization;
}
