import { InvoiceChangeLogRepository } from './../../repositories/invoice/invoiceChangeLogRepository';
import { UserService } from './../../services/user/user.service';
import { InvoiceRepository } from '../../repositories/invoice/invoiceRepository';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { EmailService } from './../../services/notification/email/email.service';
import { RoleRepository } from '../../repositories/role/roleRepository';
import {
  OrganizationInviteRepository,
  InvitationRepository,
} from '../../repositories/organization/organizationRepository';

import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { OrganizationRepository } from 'src/repositories/organization/organizationRepository';
import { UserRepository } from 'src/repositories/user/userRepository';
import { JwtStrategy } from '../identity/jwt.strategy';
import { JwtAuthGuard } from '../identity/auth/jwtauth.guard';
import { MulterModule } from '@nestjs/platform-express/multer/multer.module';
import { AppService } from 'src/services/app/app.service';
import { BankTransactionRepository } from 'src/repositories/BankTransaction/bankTransactionRepository';
import { OrganizationService } from 'src/services/organization/organization.services';
import { InvoiceService } from 'src/services/invoice/invoice-service.service';

const respositories = [
  OrganizationRepository,
  UserRepository,
  RoleRepository,
  OrganizationInviteRepository,
  InvitationRepository,
  InvoiceRepository,
  BankTransactionRepository,
];
@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrganizationRepository,
      UserRepository,
      RoleRepository,
      OrganizationInviteRepository,
      InvitationRepository,
      InvoiceRepository,
      BankTransactionRepository,
      InvoiceChangeLogRepository,
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
    ConfigModule,
    OrganizationService,
    InvoiceService,
    UserService,
  ],
  providers: [
    EmailService,
    JwtStrategy,
    JwtAuthGuard,
    AppService,
    OrganizationService,
    InvoiceService,
    UserService,
  ],
})
export class SharedModule {}
