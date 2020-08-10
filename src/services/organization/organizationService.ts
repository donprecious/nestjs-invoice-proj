import { OrganizationRole } from './../../entities/organizationRole.entity';
import { Invitation } from './../../entities/Invitations.entity';
import { OrganizationInvite } from './../../entities/organizationInvite.entity';

import { Organization } from './../../entities/organization.entity';
import { Repository, EntityRepository } from 'typeorm';

@EntityRepository(Organization)
export class OrganizationRepository extends Repository<Organization> {}

// @EntityRepository(UserOrganization)
// export class UserOrganizationRepository extends Repository<UserOrganization> {
//   constructor() {
//     super();
//   }
// }

@EntityRepository(OrganizationRole)
export class OrganizationRoleRepository extends Repository<OrganizationRole> {
  constructor() {
    super();
  }
}
@EntityRepository(OrganizationInvite)
export class OrganizationInviteRepository extends Repository<
  OrganizationInvite
> {
  constructor() {
    super();
  }
}

@EntityRepository(Invitation)
export class InvitationRepository extends Repository<Invitation> {
  constructor() {
    super();
  }
}
