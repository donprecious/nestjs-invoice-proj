import { invitationStatus } from './../../../../shared/entity/entityStatus';
import { UserRepository } from './../../../../services/user/userService';
import { OrganizationRepository } from 'src/services/organization/organizationService';
import { Organization } from 'src/entities/organization.entity';
import { Mapper } from '@nartc/automapper';
import {
  ConfirmOrganizationWithUserDto,
  ConfirmUserDto,
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

    const userInfo: UserDto = {
      id: invite.user.id,
      createdOn: invite.user.createdOn,
      email: invite.user.email,
      firstName: invite.user.firstName,
      lastName: invite.user.lastName,
      phone: invite.user.phone,
    };

    if (confimationType == roleTypes.supplierAdmin) {
      const orgInfo = {
        id: invite.organization.id,
        address: invite.organization.address,
        bankNumber: invite.organization.bankNumber,
        bankname: invite.organization.bankname,
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

  @Put(':invitationId/organization/confirm')
  async confirmOrganizationAndUser(
    @Param('invitationId', new ParseUUIDPipe()) invitationId: string,
    @Body() confirmUserOrg: ConfirmOrganizationWithUserDto,
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

    let updatedOrganisation = invite.organization;
    updatedOrganisation.address = confirmUserOrg.orgainzation.address;
    updatedOrganisation.bankNumber = confirmUserOrg.orgainzation.bankNumber;
    updatedOrganisation.bankname = confirmUserOrg.orgainzation.bankname;
    updatedOrganisation.code = confirmUserOrg.orgainzation.code;
    updatedOrganisation.email = confirmUserOrg.orgainzation.email;
    updatedOrganisation.name = confirmUserOrg.orgainzation.name;
    updatedOrganisation.phone = confirmUserOrg.orgainzation.phone;
    updatedOrganisation.taxId = confirmUserOrg.orgainzation.taxId;
    await this.orgRepo.update(updatedOrganisation.id, updatedOrganisation);
    const userToUpdate = confirmUserOrg.user;
    let updateUser = invite.user;
    updateUser.firstName = userToUpdate.firstName;
    updateUser.lastName = userToUpdate.lastName;
    updateUser.email = userToUpdate.email;
    updateUser.phone = userToUpdate.phone;

    await this.userRepo.update(invite.user.id, updateUser);

    invite.status = invitationStatus.accepted;
    await this.invitationRepo.update(invite.id, invite);
    const userDto = userToUpdate as UserDto;
    userDto.id = updateUser.id;

    const orgDto = confirmUserOrg.orgainzation as OrganizationDto;
    orgDto.id = updatedOrganisation.id;
    return AppResponse.OkSuccess(
      {
        orgainization: userDto,
        user: orgDto,
      },
      'invitation accepted and confirmed',
    );
    // }
  }

  @Put(':invitationId/user/confirm')
  async confirmUser(
    @Param('invitationId', new ParseUUIDPipe()) invitationId: string,
    @Body() confirmUserOrg: ConfirmUserDto,
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
    if (
      invite.confirmationType != roleTypes.supplier ||
      invite.confirmationType != roleTypes.buyer
    ) {
      throw new HttpException(
        AppResponse.badRequest(
          'invalid invite, should be just a user for supplier or buyer',
        ),
        HttpStatus.BAD_REQUEST,
      );
    } else {
      const userToUpdate = confirmUserOrg.user;
      const updateUser = invite.user;
      updateUser.firstName = userToUpdate.firstName;
      updateUser.lastName = userToUpdate.lastName;
      updateUser.email = userToUpdate.email;
      updateUser.phone = userToUpdate.phone;
      await this.userRepo.update(invite.user.id, updateUser);
      invite.status = invitationStatus.accepted;
      await this.invitationRepo.update(invite.id, invite);

      const userDto = userToUpdate as UserDto;
      userDto.id = updateUser.id;
      return AppResponse.OkSuccess(
        userDto,
        'invitation accepted and confirmed',
      );
    }
  }
}
