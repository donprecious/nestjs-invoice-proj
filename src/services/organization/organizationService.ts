import { Invitation } from './../../entities/Invitations.entity';
import { OrganizationInvite } from './../../entities/organizationInvite.entity';

import { Organization } from './../../entities/organization.entity';
import { Repository, EntityRepository } from 'typeorm';
import moment = require('moment');
import { ConfigService } from '@nestjs/config';
import { ConfigConstant } from 'src/shared/constants/ConfigConstant';
import { Moment } from 'moment';
@EntityRepository(Organization)
export class OrganizationRepository extends Repository<Organization> {}

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
