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

    let updateUser = invite.user;
    const otp = GenerateRandom(10315, 99929);
    updateUser.otp = otp;
    const expiretime = moment().add(10, 'minutes');
    updateUser.otpExpiresIn = expiretime.toDate();
    //todo send email

    await this.userRepo.update(invite.user.id, updateUser);

    invite.status = updateStatus.status;
    await this.invitationRepo.update(invite.id, invite);

    const message = `Invitation Accepted! , Activate your account with this Otp : <b>${otp}</b>
    `;
    const emailMessage: EmailDto = {
      to: [updateUser.email],
      body: message,
      subject: 'Activate your Account',
    };
    this.emailSerice.sendEmail(emailMessage).subscribe(d => console.log(d));
    return AppResponse.OkSuccess({}, 'invitation accepted and confirmed');
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
    const emailMessage: EmailDto = {
      to: [updateUser.email],
      body: message,
      subject: 'Activate your Account',
    };
    this.emailSerice.sendEmail(emailMessage).subscribe(d => console.log(d));
    return AppResponse.OkSuccess(null, 'otp sent');
    }
  // @Put(':invitationId/organization/confirm')
  // async confirmOrganizationAndUser(
  //   @Param('invitationId', new ParseUUIDPipe()) invitationId: string,
  //   @Body() confirmUserOrg: ConfirmOrganizationWithUserDto,
  // ) {
  //   const invite = await this.invitationRepo.findOne({
  //     where: { id: invitationId },
  //     relations: ['user', 'organization'],
  //   });
  //   if (!invite) {
  //     throw new HttpException(
  //       AppResponse.NotFound('invitation not found'),
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }

  //   let updatedOrganisation = invite.organization;
  //   updatedOrganisation.address = confirmUserOrg.orgainzation.address;
  //   updatedOrganisation.bankNumber = confirmUserOrg.orgainzation.bankNumber;
  //   updatedOrganisation.bankcode = confirmUserOrg.orgainzation.bankcode;
  //   updatedOrganisation.code = confirmUserOrg.orgainzation.code;
  //   updatedOrganisation.email = confirmUserOrg.orgainzation.email;
  //   updatedOrganisation.name = confirmUserOrg.orgainzation.name;
  //   updatedOrganisation.phone = confirmUserOrg.orgainzation.phone;
  //   updatedOrganisation.taxId = confirmUserOrg.orgainzation.taxId;
  //   await this.orgRepo.update(updatedOrganisation.id, updatedOrganisation);
  //   const userToUpdate = confirmUserOrg.user;
  //   let updateUser = invite.user;
  //   updateUser.firstName = userToUpdate.firstName;
  //   updateUser.lastName = userToUpdate.lastName;

  //   updateUser.phone = userToUpdate.phone;

  //   const otp = GenerateRandom(10315, 99929);
  //   updateUser.otp = otp;
  //   const expiretime = moment().add(10, 'minutes');
  //   updateUser.otpExpiresIn = expiretime.toDate();
  //   //todo send email

  //   await this.userRepo.update(invite.user.id, updateUser);

  //   invite.status = invitationStatus.accepted;
  //   await this.invitationRepo.update(invite.id, invite);
  //   const userDto = (userToUpdate as unknown) as UserDto;
  //   userDto.id = updateUser.id;

  //   const orgDto = confirmUserOrg.orgainzation as OrganizationDto;
  //   orgDto.id = updatedOrganisation.id;

  //   const message = `Invitation Accepted! , Activate your account with this Otp : <b>${otp}</b>
  //   `;
  //   const emailMessage: EmailDto = {
  //     to: [updateUser.email],
  //     body: message,
  //     subject: 'Activate your Account',
  //   };
  //   this.emailSerice.sendEmail(emailMessage).subscribe(d => console.log(d));
  //   return AppResponse.OkSuccess(
  //     {
  //       orgainization: userDto,
  //       user: orgDto,
  //     },
  //     'invitation accepted and confirmed',
  //   );
  //   // }
  // }

  // @Put(':invitationId/organization/cancel')
  // async cancelOrganizationAndUser(
  //   @Param('invitationId', new ParseUUIDPipe()) invitationId: string,
  //   @Body() confirmUserOrg: ConfirmOrganizationWithUserDto,
  // ) {
  //   const invite = await this.invitationRepo.findOne({
  //     where: { id: invitationId },
  //     relations: ['user', 'organization'],
  //   });
  //   if (!invite) {
  //     throw new HttpException(
  //       AppResponse.NotFound('invitation not found'),
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }

  //   let updatedOrganisation = invite.organization;
  //   updatedOrganisation.address = confirmUserOrg.orgainzation.address;
  //   updatedOrganisation.bankNumber = confirmUserOrg.orgainzation.bankNumber;
  //   updatedOrganisation.bankcode = confirmUserOrg.orgainzation.bankcode;
  //   updatedOrganisation.code = confirmUserOrg.orgainzation.code;
  //   updatedOrganisation.email = confirmUserOrg.orgainzation.email;
  //   updatedOrganisation.name = confirmUserOrg.orgainzation.name;
  //   updatedOrganisation.phone = confirmUserOrg.orgainzation.phone;
  //   updatedOrganisation.taxId = confirmUserOrg.orgainzation.taxId;
  //   await this.orgRepo.update(updatedOrganisation.id, updatedOrganisation);
  //   const userToUpdate = confirmUserOrg.user;
  //   let updateUser = invite.user;
  //   updateUser.firstName = userToUpdate.firstName;
  //   updateUser.lastName = userToUpdate.lastName;
  //   updateUser.email = userToUpdate.email;
  //   updateUser.phone = userToUpdate.phone;

  //   await this.userRepo.update(invite.user.id, updateUser);

  //   invite.status = invitationStatus.canceled;
  //   await this.invitationRepo.update(invite.id, invite);
  //   const userDto = (userToUpdate as unknown) as UserDto;
  //   userDto.id = updateUser.id;

  //   const orgDto = confirmUserOrg.orgainzation as OrganizationDto;
  //   orgDto.id = updatedOrganisation.id;
  //   return AppResponse.OkSuccess(
  //     {
  //       orgainization: userDto,
  //       user: orgDto,
  //     },
  //     'invitation accepted and confirmed',
  //   );
  //   // }
  // }

  // @Put(':invitationId/user/confirm')
  // async confirmUser(
  //   @Param('invitationId', new ParseUUIDPipe()) invitationId: string,
  //   @Body() confirmUserOrg: ConfirmUserDto,
  // ) {
  //   const invite = await this.invitationRepo.findOne({
  //     where: { id: invitationId },
  //     relations: ['user', 'organization'],
  //   });
  //   if (!invite) {
  //     throw new HttpException(
  //       AppResponse.NotFound('invitation not found'),
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }
  //   if (
  //     invite.confirmationType != roleTypes.supplier ||
  //     invite.confirmationType != roleTypes.buyer
  //   ) {
  //     throw new HttpException(
  //       AppResponse.badRequest(
  //         'invalid invite, should be just a user for supplier or buyer',
  //       ),
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   } else {
  //     const userToUpdate = confirmUserOrg.user;
  //     const updateUser = invite.user;
  //     updateUser.firstName = userToUpdate.firstName;
  //     updateUser.lastName = userToUpdate.lastName;
  //     updateUser.email = userToUpdate.email;
  //     updateUser.phone = userToUpdate.phone;
  //     invite.status = invitationStatus.accepted;

  //     const otp = GenerateRandom(10315, 99929);
  //     updateUser.otp = otp;
  //     const expiretime = moment().add(10, 'minutes');
  //     updateUser.otpExpiresIn = expiretime.toDate();
  //     await this.userRepo.update(invite.user.id, updateUser);

  //     await this.invitationRepo.update(invite.id, invite);

  //     const userDto = (userToUpdate as unknown) as UserDto;
  //     userDto.id = updateUser.id;

  //     const message = ` Activate your account with your Otp : <b>${otp}</b>
  //     `;
  //     const emailMessage: EmailDto = {
  //       to: [updateUser.email],
  //       body: message,
  //       subject: 'Activate your Account',
  //     };
  //     this.emailSerice.sendEmail(emailMessage).subscribe(d => console.log(d));
  //     return AppResponse.OkSuccess(
  //       userDto,
  //       'invitation accepted and confirmed',
  //     );
  //   }
  // }

  // @Put(':invitationId/user/cancel')
  // async CancelUser(
  //   @Param('invitationId', new ParseUUIDPipe()) invitationId: string,
  //   @Body() confirmUserOrg: ConfirmUserDto,
  // ) {
  //   const invite = await this.invitationRepo.findOne({
  //     where: { id: invitationId },
  //     relations: ['user', 'organization'],
  //   });
  //   if (!invite) {
  //     throw new HttpException(
  //       AppResponse.NotFound('invitation not found'),
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }
  //   if (
  //     invite.confirmationType != roleTypes.supplier ||
  //     invite.confirmationType != roleTypes.buyer
  //   ) {
  //     throw new HttpException(
  //       AppResponse.badRequest(
  //         'invalid invite, should be just a user for supplier or buyer',
  //       ),
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   } else {
  //     const userToUpdate = confirmUserOrg.user;
  //     const updateUser = invite.user;
  //     updateUser.firstName = userToUpdate.firstName;
  //     updateUser.lastName = userToUpdate.lastName;
  //     updateUser.email = userToUpdate.email;
  //     updateUser.phone = userToUpdate.phone;
  //     await this.userRepo.update(invite.user.id, updateUser);
  //     invite.status = invitationStatus.canceled;
  //     await this.invitationRepo.update(invite.id, invite);

  //     const userDto = (userToUpdate as unknown) as UserDto;
  //     userDto.id = updateUser.id;
  //     return AppResponse.OkSuccess(
  //       userDto,
  //       'invitation accepted and confirmed',
  //     );
  //   }
  // }
}
