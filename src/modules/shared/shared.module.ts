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
import { MulterModule } from '@nestjs/platform-express/multer/multer.module';
import { AppService } from 'src/services/app/app.service';

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
    MulterModule.register({
      dest: '/upload',
    }),
  ],

  exports: [
    TypeOrmModule.forFeature(),
    HttpModule,
    EmailService,
    JwtStrategy,
    JwtAuthGuard,
    AppService,
    MulterModule.register(),
  ],
  providers: [EmailService, JwtStrategy, JwtAuthGuard, AppService],
})
export class SharedModule {}
