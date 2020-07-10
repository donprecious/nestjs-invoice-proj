import {
  RoleRepository,
  UserRoleRepository,
} from './../../services/role/roleService';
import {
  UserOrganizationRepository,
  OrganizationInviteRepository,
} from './../../services/organization/organizationService';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { OrganizationRepository } from 'src/services/organization/organizationService';
import { UserRepository } from 'src/services/user/userService';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrganizationRepository,
      UserRepository,
      UserOrganizationRepository,
      RoleRepository,
      UserRoleRepository,
      OrganizationInviteRepository,
    ]),
  ],
  exports: [TypeOrmModule.forFeature()],
})
export class SharedModule {}
