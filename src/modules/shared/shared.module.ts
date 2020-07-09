import { UserOrganizationRepository } from './../../services/organization/organizationService';
import { UserRepository } from './../../services/userService';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { OrganizationRepository } from 'src/services/organization/organizationService';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrganizationRepository,
      UserRepository,
      UserOrganizationRepository,
    ]),
  ],
  exports: [TypeOrmModule.forFeature()],
})
export class SharedModule {}
