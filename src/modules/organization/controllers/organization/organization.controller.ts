import { OrganizationFilter } from './../../../../dto/organization/organization.dto';
import { organizationType } from './../../../../shared/app/organizationType';
import { UserDto } from './../../../../dto/user/user.dto';
import { EditOrganizationDto } from './../../../../dto/organization/create-organization.dto';
import { GenerateRandom } from './../../../../shared/helpers/utility';
import {
  CreateUserDto,
  EditUserDto,
} from './../../../../dto/organization/create-user.dto';
import { AppService } from './../../../../services/app/app.service';

import { invitationStatus } from './../../../../shared/entity/entityStatus';
import { Invitation } from './../../../../entities/Invitations.entity';
import { OrganizationInvite } from './../../../../entities/organizationInvite.entity';

import { roleTypes } from './../../../../shared/app/roleTypes';
import { RoleRepository } from './../../../../services/role/roleService';

import { CreateOrganizationUserDto } from 'src/dto/user/create-organization-user.dto';
import {
  OrganizationRepository,
  OrganizationInviteRepository,
  InvitationRepository,
} from './../../../../services/organization/organizationService';
import { AppResponse } from './../../../../shared/helpers/appresponse';
import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Request,
  BadRequestException,
  Get,
  UseGuards,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger/dist/decorators/api-use-tags.decorator';
import { Organization } from 'src/entities/organization.entity';
import { User } from 'src/entities/User.entity';
import { UserRepository } from 'src/services/user/userService';
import { ApiHeader } from '@nestjs/swagger/dist';
import { CreateOrganizationDto } from 'src/dto/organization/create-organization.dto';
import { ConfigService } from '@nestjs/config';
import { EmailService } from 'src/services/notification/email/email.service';
import { ConfigConstant } from 'src/shared/constants/ConfigConstant';
import { EmailDto } from 'src/shared/dto/emailDto';
import { JwtAuthGuard } from 'src/modules/identity/auth/jwtauth.guard';
import moment = require('moment');
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';
import { String } from 'lodash';
import { PromiseUtils, FindConditions, Like } from 'typeorm';
import { GetRoleDto } from 'src/dto/role/role.dto';
@UseGuards(JwtAuthGuard)
@ApiTags('organization')
@Controller('organization')
export class OrganizationController {
  constructor(
    private orgService: OrganizationRepository,
    private userRepo: UserRepository,

    private roleRepo: RoleRepository,

    private orgInvite: OrganizationInviteRepository,
    private invitationRepo: InvitationRepository,
    private appService: AppService,
    private emailSerice: EmailService,
    private configService: ConfigService,
  ) {}

  @ApiHeader({
    name: 'organizationId',
    description: 'provide organization id',
  })
  @Post()
  async create(@Body() createOrg: CreateOrganizationDto, @Request() req) {
    let organization: Organization;
    if (createOrg.type == organizationType.supplier) {
      organization = await this.appService.FindOrganization(createOrg.buyerId);
    } else {
      organization = await this.appService.getOrganization();
    }

    const org = (createOrg as unknown) as Organization;

    // check if an org exist in the db
    const existedOrg = await this.orgService.find({
      where: { code: org.code },
    });
    if (existedOrg.length > 0) {
      throw new BadRequestException(
        AppResponse.badRequest(
          'an organization with same organization code already exist',
        ),
      );
    }

    await this.orgService.insert(org);

    const orgInvite = {
      invitedByOrganization: organization,
      inviteeOrganization: org,
    } as OrganizationInvite;
    this.orgInvite.save(orgInvite);

    return AppResponse.OkSuccess(org);
  }

  @Put(':organizationId')
  async edit(
    @Body() editOrg: EditOrganizationDto,
    @Param('organizationId') organizationId: string,
  ) {
    const organization = await this.orgService.findOne({
      where: { id: organizationId },
    });

    // check if orgaization exist
    if (!organization) {
      throw new BadRequestException(
        AppResponse.badRequest('organization not found'),
      );
    }
    const existedOrg = await this.orgService.findOne({
      where: { code: editOrg.code },
    });
    if (existedOrg && existedOrg.id != organization.id) {
      throw new BadRequestException(
        AppResponse.badRequest(
          'an organization with same organization code already exist',
        ),
      );
    }
    const currentUser = await this.appService.getCurrentUser();

    organization.address = editOrg.address;
    organization.bankNumber = editOrg.bankNumber;
    organization.bankcode = editOrg.bankcode;
    organization.code = editOrg.code;
    organization.email = editOrg.email;
    organization.name = editOrg.name;
    organization.phone = editOrg.phone;
    organization.taxId = editOrg.taxId;
    organization.status = editOrg.status;

    organization.updatedBy = currentUser.id;

    console.log(organization);

    await this.orgService.update(organization.id, organization);

    return AppResponse.OkSuccess(organization);
  }

  @ApiHeader({
    name: 'organizationId',
    description: 'provide organization id',
  })
  @Post('user')
  async createWithUser(
    @Body() createUserOrg: CreateOrganizationUserDto,
    @Request() req,
  ) {
    let organization: Organization;
    if (createUserOrg.organization.type == organizationType.supplier) {
      organization = await this.appService.FindOrganization(
        createUserOrg.organization.buyerId,
      );
    } else {
      organization = await this.appService.getOrganization();
    }

    const currentUser = await this.appService.getCurrentUser();

    const org = (createUserOrg.organization as unknown) as Organization;

    // check if an org exist in the db
    const existedOrg = await this.orgService.find({
      where: { code: org.code },
    });
    if (existedOrg.length > 0) {
      throw new BadRequestException(
        AppResponse.badRequest(
          'an organization with same organization code already exist',
        ),
      );
    }
    let rolename = org.type;
    if (rolename.toLowerCase() == roleTypes.supplier.toLowerCase()) {
      rolename = roleTypes.supplierAdmin;
    } else if (rolename.toLowerCase() == roleTypes.buyer.toLowerCase()) {
      rolename = roleTypes.buyerAdmin;
    }
    const role = await this.roleRepo.findOne({ where: { Name: rolename } });
    if (!role) {
      throw new BadRequestException(
        AppResponse.badRequest(
          `organization type is not recognized and cannot be assigned a role, or the role ${rolename} does not exist`,
        ),
      );
    }
    const user = (createUserOrg.user as unknown) as User;

    const userFound = await this.userRepo.findOne({
      where: { email: user.email },
    });
    if (userFound) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error:
            'user with this email ' +
            userFound.email +
            '  already exist, use another one',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.orgService.insert(org);

    user.organization = org;
    user.role = role;
    await this.userRepo.insert(user);

    const createByOrgan = await this.orgService.findOne({
      where: { id: organization.id },
    });
    if (createByOrgan) {
      const orgInvite = {
        invitedByOrganization: createByOrgan,
        inviteeOrganization: org,
      } as OrganizationInvite;
      this.orgInvite.save(orgInvite);
    }

    // todo create invitation and sent email to this user
    const invitation = {
      invitedByUser: currentUser, // update to current loggedin user
      confirmationType: roleTypes.supplierAdmin,
      organization: org,
      status: invitationStatus.pending,
      user: user,
    } as Invitation;
    await this.invitationRepo.save(invitation);
    // todo send email to this user with invitation link]
    const inviteUrl =
      this.configService.get(ConfigConstant.frontendUrl) +
      `join/?inviteId=${invitation.id}`;
    const message = `Hello You have been invited to Verify and Activate your account 
      <br> click the click below <a href='${inviteUrl}'>Activate account</a>
    `;
    const emailMessage: EmailDto = {
      to: [org.email, user.email],
      body: message,
      subject: 'Invitation ',
    };
    this.emailSerice.sendEmail(emailMessage).subscribe(d => console.log(d));
    return AppResponse.OkSuccess(createUserOrg);
  }

  @ApiHeader({
    name: 'organizationId',
    description: 'provide organization id',
  })
  @Post('add-user')
  async addUser(@Body() createUser: CreateUserDto) {
    const org = await this.appService.getOrganization();
    const currentUser = await this.appService.getCurrentUser();
    const user = (createUser as unknown) as User;
    const userFound = await this.userRepo.findOne({
      where: { email: user.email },
    });
    if (userFound) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error:
            'user with this email ' +
            userFound.email +
            '  already exist, use another one',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    let rolename = org.type;
    if (!createUser.role) {
      rolename = createUser.role;
    }
    const role = await this.roleRepo.findOne({ where: { Name: rolename } });

    if (!role) {
      throw new BadRequestException(AppResponse.badRequest('role not found'));
    }
    user.role = role;
    user.organization = org;
    await this.userRepo.insert(user);

    const invitation = {
      invitedByUser: currentUser, // update to current loggedin user
      confirmationType: roleTypes.supplierAdmin,
      organization: org,
      status: invitationStatus.pending,
      user: user,
    } as Invitation;
    await this.invitationRepo.save(invitation);
    // todo send email to this user with invitation link]
    const inviteUrl =
      this.configService.get(ConfigConstant.frontendUrl) +
      `join/?inviteId=${invitation.id}`;
    const message = `Hello You have been invited to Verify and Activate your account
      <br> click the click below <a href='${inviteUrl}'>Activate account</a>
    `;
    const emailMessage: EmailDto = {
      to: [user.email],
      body: message,
      subject: 'Activate Your Account',
    };
    this.emailSerice.sendEmail(emailMessage).subscribe(d => console.log(d));
    return AppResponse.OkSuccess({});
  }

  @ApiHeader({
    name: 'organizationId',
    description: 'provide organization id',
  })
  @Put('edit-user/:userId')
  async EditUser(
    @Body() editUser: EditUserDto,
    @Param('userId') userId: string,
  ) {
    const currentUser = await this.appService.getCurrentUser();

    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['role'],
    });
    if (!user) {
      throw new NotFoundException(AppResponse.NotFound('user not found'));
    }
    user.firstName = editUser.firstName;
    user.lastName = editUser.lastName;
    user.phone = editUser.phone;
    user.status = editUser.status.toLowerCase();
    user.updatedBy = currentUser.id;
    const rolename = editUser.role;
    if (rolename) {
      const role = await this.roleRepo.findOne({ where: { Name: rolename } });

      if (!role) {
        throw new BadRequestException(AppResponse.badRequest('role not found'));
      }
      // check if user is in that role
      user.role = role;
    }
    await this.userRepo.update(user.id, user);

    return AppResponse.OkSuccess(user, 'user updated');
  }

  // get all suppliers invitted by a buyer
  @Get('suppliers/buyer/:buyerId')
  async mySupplier(@Param('buyerId') buyerId: string) {
    const buyerOrg = await this.orgService.findOne({ where: { id: buyerId } });
    if (!buyerOrg) {
      throw new NotFoundException(AppResponse.NotFound('buer not found'));
    }
    const orgInvite = await this.orgInvite.find({
      where: { invitedByOrganization: buyerOrg },
      relations: ['inviteeOrganization', 'invitedByOrganization'],
    });

    const suppliers = orgInvite.map(a => a.inviteeOrganization);
    return AppResponse.OkSuccess(suppliers);
  }

  @Get('suppliers')
  async GetSupplier(@Query() filters: OrganizationFilter) {
    const where: FindConditions<Organization> = {
      type: organizationType.supplier,
    };
    if (filters.search) {
      where.name = Like(`%${filters.search}%`);
    }
    const buyer = await this.orgService.find({
      where: where,
    });

    return AppResponse.OkSuccess(buyer);
  }

  @Get('buyers')
  async GetBuyers() {
    const buyers = await this.orgService.find({
      where: { type: organizationType.buyer },
    });
    return AppResponse.OkSuccess(buyers);
  }

  //get all buyers a supplier belongs to
  @Get('buyers/supplier/:supplierId')
  async GetBuyerSupplier(@Param('supplierId') supplierId: string) {
    const supplier = await this.orgService.findOne({
      where: { id: supplierId },
    });
    if (!supplier) {
      throw new NotFoundException(AppResponse.NotFound('supplier not found'));
    }
    const orgInvite = await this.orgInvite.find({
      where: { inviteeOrganization: supplier },
      relations: ['inviteeOrganization', 'invitedByOrganization'],
    });

    const suppliers = orgInvite.map(a => a.inviteeOrganization);
    return AppResponse.OkSuccess(suppliers);
  }

  @ApiHeader({
    name: 'organizationId',
    description: 'provide organization id',
  })
  @Get(':organizationId/users')
  async GetOrgUsers(@Param('organizationId') organizationId: string) {
    const org = await this.appService.FindOrganization(organizationId);

    // const userOrg = await this.userOrgRepo.find({
    //   where: { organization: org },
    //   relations: ['user', 'user.userRoles', 'user.userRoles.role'],
    // });

    const users = await this.userRepo.find({ where: { organization: org } });
    return AppResponse.OkSuccess(users);
  }

  @Get('users/:userId')
  async GetOrgUser(@Param('userId') userId: string) {
    const result = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!result) {
      throw new NotFoundException(AppResponse.NotFound());
    }
    const role = {
      Permissions: result.role.permission,
      description: result.role.Description,
      name: result.role.Name,
      type: result.role.type,
    } as GetRoleDto;
    const user = {
      email: result.email,
      id: result.id,
      firstName: result.firstName,
      lastName: result.lastName,
      phone: result.phone,
      createdOn: result.createdOn,
      role: role,
    } as UserDto;

    return AppResponse.OkSuccess(user);
  }

  @Get(':organizationId')
  async Get(@Param('organizationId') organizationId: string) {
    const organization = await this.orgService.findOne({
      where: { id: organizationId },
    });

    // check if orgaization exist
    if (!organization) {
      throw new BadRequestException(
        AppResponse.badRequest('organization not found'),
      );
    }

    return AppResponse.OkSuccess(organization);
  }
  
}
