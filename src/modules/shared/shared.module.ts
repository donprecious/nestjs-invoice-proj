import { InvoiceRepository } from './../../services/invoice/invoice';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { EmailService } from './../../services/notification/email/email.service';
import {
  RoleRepository,
  UserRoleRepository,
} from './../../services/role/roleService';
import {
  UserOrganizationRepository,
  OrganizationInviteRepository,
  InvitationRepository,
} from './../../services/organization/organizationService';

import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { OrganizationRepository } from 'src/services/organization/organizationService';
import { UserRepository } from 'src/services/user/userService';
import { JwtStrategy } from '../identity/jwt.strategy';
import { JwtAuthGuard } from '../identity/auth/jwtauth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrganizationRepository,
      UserRepository,
      UserOrganizationRepository,
      RoleRepository,
      UserRoleRepository,
      OrganizationInviteRepository,
      InvitationRepository,
      InvoiceRepository,
    ]),
    HttpModule,
    ConfigModule,
  ],

  exports: [
    TypeOrmModule.forFeature(),
    HttpModule,
    EmailService,
    JwtStrategy,
    JwtAuthGuard,
  ],
  providers: [EmailService, JwtStrategy, JwtAuthGuard],
})
export class SharedModule {}
