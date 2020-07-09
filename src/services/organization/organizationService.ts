import { UserOrganization } from './../../entities/userOrganization.entity';
import { Organization } from './../../entities/organization.entity';
import { Repository, EntityRepository } from 'typeorm';

@EntityRepository(Organization)
export class OrganizationRepository extends Repository<Organization> {}

@EntityRepository(UserOrganization)
export class UserOrganizationRepository extends Repository<UserOrganization> {}
