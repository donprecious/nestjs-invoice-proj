import { Organization } from 'src/entities/organization.entity';
import { SharedModule } from './../shared/shared.module';
import { Module } from '@nestjs/common';
import { OrganizationController } from './controllers/organization/organization.controller';
import { TypeOrmModule } from '@nestjs/typeorm/dist';
import { OrganizationRepository } from 'src/services/organization/organizationService';

@Module({
  controllers: [OrganizationController],
  imports: [SharedModule],
})
export class OrganizationModule {}
