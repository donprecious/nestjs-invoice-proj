import { UserRepository } from './../user/userService';
import { User } from './../../entities/User.entity';
import { JwtPayloadDto } from './../../shared/dto/jwt.dto';
import { Organization } from './../../entities/organization.entity';
import { OrganizationRepository } from './../organization/organizationService';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { BadRequestException } from '@nestjs/common/exceptions/bad-request.exception';
import { AppResponse } from 'src/shared/helpers/appresponse';
import { ConfigService } from '@nestjs/config';
import { Moment } from 'moment';
import moment = require('moment');
import { ConfigConstant } from 'src/shared/constants/ConfigConstant';

@Injectable()
export class AppService {
  constructor(
    @Inject(REQUEST) private request: Request,
    private orgRepo: OrganizationRepository,
    private userRepo: UserRepository,
    private configService: ConfigService,
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

  async FindOrganization(orgnizationId): Promise<Organization> {
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

  getLoggedUser(): JwtPayloadDto {
    const request = this.request as any;
    const user = request.user as JwtPayloadDto;
    return user;
  }

  async getCurrentUser(): Promise<User> {
    const loggedUser = this.getLoggedUser();
    if (!loggedUser) {
      throw new BadRequestException(
        AppResponse.badRequest('organization-id not present in header'),
      );
    }

    const user = await this.userRepo.findOne({
      where: { id: loggedUser.userId },
    });

    return user;
  }
  generateInvitationExpireTime(): Moment {
    let duration = this.configService.get<number>(
      ConfigConstant.invitationExpireTimeInMintues,
    );
    if (!duration) {
      duration = 10;
    }
    const timeToExpire = moment().add(duration, 'minutes');
    return timeToExpire;
  }
}
