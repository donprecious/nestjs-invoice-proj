import { getTemplate } from './../../../../providers/EmailTemplate/welcome';
import { invitationStatus } from './../../../../shared/entity/entityStatus';
import { UserRepository } from './../../../../services/user/userService';
import { OrganizationRepository } from 'src/services/organization/organizationService';
import { Organization } from 'src/entities/organization.entity';
import { Mapper } from '@nartc/automapper';
import {
  ConfirmOrganizationWithUserDto,
  ConfirmUserDto,
  UpdateInvitationStatusDto,
} from './../../../../dto/user/create-organization-user.dto';
import { AppResponse } from './../../../../shared/helpers/appresponse';
import { UserDto } from './../../../../dto/user/user.dto';
import { OrganizationDto } from './../../../../dto/organization/organization.dto';
import { roleTypes } from './../../../../shared/app/roleTypes';
import { InvitationRepository } from './../../../../services/organization/organizationService';
import {
  BadRequestException,
  Controller,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  Get,
  Put,
} from '@nestjs/common/decorators/http/request-mapping.decorator';
import { ApiTags } from '@nestjs/swagger/dist/decorators';
import {
  classToClass,
  plainToClass,
  plainToClassFromExist,
} from 'class-transformer';
import { CreateOrganizationUserDto } from 'src/dto/user/create-organization-user.dto';
import { Body } from '@nestjs/common/decorators/http/route-params.decorator';
import { validate } from 'class-validator';
import { GenerateRandom } from 'src/shared/helpers/utility';
import moment = require('moment');
import { ConfigService } from '@nestjs/config';
import { AppService } from 'src/services/app/app.service';
import { EmailService } from 'src/services/notification/email/email.service';
import { EmailDto } from 'src/shared/dto/emailDto';
import { ConfigConstant } from 'src/shared/constants/ConfigConstant';
import { getWelcomeMessage } from 'src/providers/EmailTemplate/welcomeMessage';

@ApiTags('invitation')
@Controller('invitation')
export class InvitationController {
  /**
   *
   */
  constructor(
    private invitationRepo: InvitationRepository,
    private orgRepo: OrganizationRepository,
    private userRepo: UserRepository,
    private emailSerice: EmailService,
    private configService: ConfigService,
    private appService: AppService,
  ) {}

  @Get(':invitationId')
  async GetInvitation(
    @Param('invitationId', new ParseUUIDPipe()) invitationId: string,
  ) {
    const invite = await this.invitationRepo.findOne({
      where: { id: invitationId },
      relations: ['user', 'organization'],
    });
    if (!invite) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'invitation not found',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const hasExpired = moment().isAfter(invite.ExpiresIn);
    if (hasExpired) {
      throw new BadRequestException(
        AppResponse.badRequest('invalid or expired invitation'),
      );
    }
    if (
      invite.status === invitationStatus.accepted ||
      invite.status === invitationStatus.canceled
    ) {
      throw new BadRequestException(
        AppResponse.badRequest('invalid or expired invitation'),
      );
    }
    const confimationType = invite.confirmationType;

    const userInfo = {
      id: invite.user.id,
      createdOn: invite.user.createdOn,
      email: invite.user.email,
      firstName: invite.user.firstName,
      lastName: invite.user.lastName,
      phone: invite.user.phone,
    } as UserDto;

    if (confimationType == roleTypes.supplierAdmin) {
      const orgInfo = {
        id: invite.organization.id,
        address: invite.organization.address,
        bankNumber: invite.organization.bankNumber,
        bankcode: invite.organization.bankcode,
        code: invite.organization.code,
        email: invite.organization.email,
        createdOn: invite.organization.createdOn,
        name: invite.organization.name,
        phone: invite.organization.phone,
        taxId: invite.organization.taxId,
        type: invite.organization.type,
      } as OrganizationDto;

      invite.organization as OrganizationDto;
      const response = AppResponse.OkSuccess({
        org: orgInfo,
        user: userInfo,
        confimationType,
        status: invite.status,
      });
      return response;
    } else {
      const response = AppResponse.OkSuccess({
        user: userInfo,
        confimationType,
        status: invite.status,
      });
      return response;
    }
  }

  @Put(':invitationId/update')
  async UpdateInvitation(
    @Param('invitationId', new ParseUUIDPipe()) invitationId: string,
    @Body() updateStatus: UpdateInvitationStatusDto,
  ) {
    const invite = await this.invitationRepo.findOne({
      where: { id: invitationId },
      relations: ['user', 'organization'],
    });
    if (!invite) {
      throw new HttpException(
        AppResponse.NotFound('invitation not found'),
        HttpStatus.BAD_REQUEST,
      );
    }

    const updateUser = invite.user;
    const otp = GenerateRandom(10315, 99929);
    updateUser.otp = otp;
    const expiretime = moment().add(10, 'minutes');
    updateUser.otpExpiresIn = expiretime.toDate();
    //todo send email

    await this.userRepo.update(invite.user.id, updateUser);

    invite.status = updateStatus.status;
    await this.invitationRepo.update(invite.id, invite);
    if (updateStatus.status == invitationStatus.accepted) {
      const message = `Invitation Accepted! , Activate your account with this Otp : <b>${otp}</b>
      `;
      const template = getTemplate(message);
      const emailMessage: EmailDto = {
        to: [updateUser.email],
        body: template,
        subject: 'Activate your Account',
      };
      this.emailSerice.sendEmail(emailMessage).subscribe(d => console.log(d));
      return AppResponse.OkSuccess({}, 'invitation accepted and confirmed');
    }
    return AppResponse.OkSuccess({}, 'invitation ' + updateStatus.status);
    // }
  }

  @Get(':invitationId/resend-otp')
  async ResendOtp(
    @Param('invitationId', new ParseUUIDPipe()) invitationId: string,
  ) {
    const invite = await this.invitationRepo.findOne({
      where: { id: invitationId },
      relations: ['user', 'organization'],
    });

    if (!invite) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'invitation not found',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const updateUser = invite.user;

    const otp = await this.userRepo.generateOtp(updateUser);

    const message = ` Activate your account with your Otp : <b>${otp}</b>
    `;
    const template = getTemplate(message);
    const emailMessage: EmailDto = {
      to: [updateUser.email],
      body: template,
      subject: 'Activate your Account',
    };
    this.emailSerice.sendEmail(emailMessage).subscribe(d => console.log(d));
    return AppResponse.OkSuccess(null, 'otp sent');
  }

  @Get(':invitationId/resend')
  async ResendInvitation(
    @Param('invitationId', new ParseUUIDPipe()) invitationId: string,
  ) {
    const invite = await this.invitationRepo.findOne({
      where: { id: invitationId },
      relations: ['user', 'organization'],
    });

    if (!invite) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'invitation not found',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (invite.status == invitationStatus.accepted) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'invitation already accepted',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const expiresIn = this.appService.generateInvitationExpireTime().toDate();

    invite.ExpiresIn = expiresIn;
    invite.status = invitationStatus.pending;

    await this.invitationRepo.update(invite.id, invite);
    // todo send email to this user with invitation link]
    const inviteUrl =
      this.configService.get(ConfigConstant.frontendUrl) +
      `join/?inviteId=${invite.id}`;

    const link = `<a href=${inviteUrl}>${inviteUrl}</a>`;
    const message = getWelcomeMessage(
      invite.user.firstName + ' ' + invite.user.lastName,
      link,
    );
    const template = getTemplate(message);
    const emailMessage: EmailDto = {
      to: [invite.user.email],
      body: template,
      subject: 'Activate Your Account',
    };
    this.emailSerice.sendEmail(emailMessage).subscribe(d => console.log(d));
    return AppResponse.OkSuccess({}, 'invitation sent');
  }
}
