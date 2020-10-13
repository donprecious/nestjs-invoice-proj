import { Organization } from 'src/entities/organization.entity';
import { SharedModule } from './../shared/shared.module';
import { Module } from '@nestjs/common';
import { OrganizationController } from './controllers/organization/organization.controller';
import { TypeOrmModule } from '@nestjs/typeorm/dist';
import { OrganizationRepository } from 'src/repositories/organization/organizationRepository';
import { InvitationController } from './controllers/invitation/invitation.controller';

@Module({
  controllers: [OrganizationController, InvitationController],
  imports: [SharedModule],
})
export class OrganizationModule {}
