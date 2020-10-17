import { UserService } from './../../../../services/user/user.service';
import { getTemplate } from './../../../../providers/EmailTemplate/welcome';
import { invitationStatus } from './../../../../shared/entity/entityStatus';
import { UserRepository } from '../../../../repositories/user/userRepository';
import { OrganizationRepository } from 'src/repositories/organization/organizationRepository';
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
import {
  InvitationRepository,
  OrganizationInviteRepository,
} from '../../../../repositories/organization/organizationRepository';
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
import { statusConstant } from 'src/shared/constants/StatusConstant';

@ApiTags('invitation')
@Controller('invitation')
export class InvitationController {
  /**
   *
   */
  constructor(
    private invitationRepo: InvitationRepository,
    private orgRepo: OrganizationRepository,
    private orgInviteRepo: OrganizationInviteRepository,
    private userRepo: UserRepository,
    private emailSerice: EmailService,
    private configService: ConfigService,
    private appService: AppService,
    private userService: UserService,
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

    // TO-DO set invitation to cancel if invitation status is cancelled

    // set organization to accepted
    const org = invite.organization;
    if (updateStatus.status == invitationStatus.accepted) {
      org.status = statusConstant.active;
    }

    await this.orgRepo.update(org.id, org);

    const updateUser = invite.user;
    const otp = GenerateRandom(10315, 99929);
    updateUser.otp = otp;
    const expiretime = moment().add(10, 'minutes');
    updateUser.otpExpiresIn = expiretime.toDate();
    //todo send email

    await this.userRepo.update(invite.user.id, updateUser);

    invite.status = updateStatus.status;
    await this.invitationRepo.update(invite.id, invite);
    const organization = invite.organization;
    const organizationInvite = await this.orgInviteRepo.findOne({
      where: { inviteeOrganization: organization },
    });
    organizationInvite.status = updateStatus.status;
    await this.orgInviteRepo.update(organizationInvite.id, organizationInvite);
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

    const otp = await this.userService.generateOtp(updateUser);

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
      relations: [
        'user',
        'organization',
        'user.role',
        'invitedByUser.organization',
      ],
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
    const otp = GenerateRandom(10315, 99929);
    const user = invite.user;
    user.otp = otp;
    const expiretime = moment().add(20, 'minutes');
    user.otpExpiresIn = expiretime.toDate();
    await this.userRepo.save(user);
    let moreInfo = ' ';
    const organizationInvite = await this.orgInviteRepo.findOne({
      where: { inviteeOrganization: invite.organization },
    });
    if (organizationInvite.status == invitationStatus.accepted) {
      //  create otp and send the user
      const inviteUrl =
        this.configService.get(ConfigConstant.frontendUrl) +
        `auth/activate/${user.id}/?inviteId=${invite.id}`;

      moreInfo = `Activate your account with this Otp : <b>${otp}</b>`;
      const link = `<a href=${inviteUrl}>${inviteUrl}</a>`;
      const message = getWelcomeMessage(
        user.firstName + ' ' + user.lastName,
        link,
        user.role.type,
        invite.invitedByUser.organization.name,
        moreInfo,
        invite.invitedByUser.firstName + ' ' + invite.invitedByUser.lastName,
      );
      const template = getTemplate(message);
      const emailMessage: EmailDto = {
        to: [user.email],
        body: template,
        subject: 'Activate your Account',
      };
      this.emailSerice.sendEmail(emailMessage).subscribe(d => console.log(d));
    } else {
      const role = invite.user.role;
      if (role.type == roleTypes.admin) {
        const inviteUrl =
          this.configService.get(ConfigConstant.frontendUrl) +
          `join/?inviteId=${invite.id}`;

        const link = `<a href=${inviteUrl}>${inviteUrl}</a>`;
        const message = getWelcomeMessage(
          user.firstName + ' ' + user.lastName,
          link,
          user.role.type,
          invite.invitedByUser.organization.name,
          ' ',
          invite.invitedByUser.firstName + ' ' + invite.invitedByUser.lastName,
        );
        const template = getTemplate(message);
        const emailMessage: EmailDto = {
          to: [user.email],
          body: template,
          subject: 'Activate Your Account',
        };
        this.emailSerice.sendEmail(emailMessage).subscribe(d => console.log(d));
      }
    }

    // const message = getWelcomeMessage(
    //   invite.user.firstName + ' ' + invite.user.lastName,
    //   link,
    //   invite.user.role.type,
    //   invite.invitedByUser.organization.name,
    //   " "
    // );
    // const template = getTemplate(message);
    // const emailMessage: EmailDto = {
    //   to: [invite.user.email],
    //   body: template,
    //   subject: 'Activate Your Account',
    // };
    // this.emailSerice.sendEmail(emailMessage).subscribe(d => console.log(d));
    return AppResponse.OkSuccess({}, 'invitation sent');
  }
}
