import { Organization } from './../../entities/organization.entity';
import { OrganizationRepository } from './../organization/organizationService';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { BadRequestException } from '@nestjs/common/exceptions/bad-request.exception';
import { AppResponse } from 'src/shared/helpers/appresponse';

@Injectable()
export class AppService {
  constructor(
    @Inject(REQUEST) private request: Request,
    private orgRepo: OrganizationRepository,
  ) {}

  async getOrganization(): Promise<Organization> {
    let orgnizationId = this.request.headers['organization-id'];
    if (!orgnizationId) {
      throw new BadRequestException(
        AppResponse.badRequest('organization-id not present in header'),
      );
    }
    orgnizationId = orgnizationId.toString();

    const organization = await this.orgRepo.findOne({
      where: { id: orgnizationId },
    });
    if (!organization) {
      throw new NotFoundException(
        AppResponse.NotFound(
          'organization from header {organization-id} not found',
        ),
      );
    }
    return organization;
  }
}
