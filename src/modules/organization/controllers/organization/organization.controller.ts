import { getWelcomeMessage } from './../../../../providers/EmailTemplate/welcomeMessage';
import { getTemplate } from './../../../../providers/EmailTemplate/welcome';
import {
  SupplierPermissions,
  BuyerPermissions,
  UserPermissions,
} from './../../../../shared/app/permissionsType';
import { statusConstant } from 'src/shared/constants/StatusConstant';
import { AllowPermissions } from './../../../../shared/guards/permission.decorator';
import { RolePermissionGuard } from './../../../../shared/guards/role-permission.guard';
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
import { RoleRepository } from '../../../../repositories/role/roleRepository';

import { CreateOrganizationUserDto } from 'src/dto/user/create-organization-user.dto';
import {
  OrganizationRepository,
  OrganizationInviteRepository,
  InvitationRepository,
} from '../../../../repositories/organization/organizationRepository';
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
import { UserRepository } from 'src/repositories/user/userRepository';
import { ApiHeader } from '@nestjs/swagger/dist';
import { CreateOrganizationDto } from 'src/dto/organization/create-organization.dto';
import { ConfigService } from '@nestjs/config';
import { EmailService } from 'src/services/notification/email/email.service';
import { ConfigConstant } from 'src/shared/constants/ConfigConstant';
import { EmailDto } from 'src/shared/dto/emailDto';
import { JwtAuthGuard } from 'src/modules/identity/auth/jwtauth.guard';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';
import { FindConditions, Like } from 'typeorm';
import { GetRoleDto } from 'src/dto/role/role.dto';
import { OrganizationService } from 'src/services/organization/organization.services';
import moment = require('moment');
@UseGuards(JwtAuthGuard, RolePermissionGuard)
@ApiTags('organization')
@Controller('organization')
export class OrganizationController {
  constructor(
    private orgRepo: OrganizationRepository,
    private userRepo: UserRepository,
    private roleRepo: RoleRepository,
    private orgInvite: OrganizationInviteRepository,
    private invitationRepo: InvitationRepository,
    private appService: AppService,
    private emailSerice: EmailService,
    private configService: ConfigService,
    private orgService: OrganizationService,
  ) {}

  @ApiHeader({
    name: 'organizationId',
    description: 'provide organization id',
  })
  @Post()
  @AllowPermissions(
    SupplierPermissions.createSuppier,
    BuyerPermissions.createBuyer,
  )
  async create(@Body() createOrg: CreateOrganizationDto, @Request() req) {
    let organization: Organization;
    if (createOrg.type == organizationType.supplier) {
      organization = await this.appService.FindOrganization(createOrg.buyerId);
    } else {
      organization = await this.appService.getOrganization();
    }

    const org = (createOrg as unknown) as Organization;

    // check if an org exist in the db
    const existedOrg = await this.orgRepo.find({
      where: { code: org.code },
    });
    if (existedOrg.length > 0) {
      throw new BadRequestException(
        AppResponse.badRequest(
          'an organization with same organization code already exist',
        ),
      );
    }
    if (org.type == organizationType.supplier) {
      org.parentId = organization.id;
    }

    if (org.type == organizationType.buyer) {
      if (createOrg.apr) {
        org.apr = createOrg.apr;
      } else {
        const apr = this.configService.get<number>(ConfigConstant.APR);
        if (apr) {
          org.apr = apr;
        }
      }
    }

    org.status = statusConstant.inactive;

    await this.orgRepo.insert(org);

    if (org.type == organizationType.supplier) {
      if (createOrg.discountRatio) {
        await this.orgService.ComputeSupplierApr(
          org.id,
          createOrg.discountRatio,
        );
      }
    }
    const orgInvite = {
      invitedByOrganization: organization,
      inviteeOrganization: org,
    } as OrganizationInvite;
    this.orgInvite.save(orgInvite);

    return AppResponse.OkSuccess(org);
  }

  @AllowPermissions(SupplierPermissions.editSuppier, BuyerPermissions.editBuyer)
  @Put(':organizationId')
  async edit(
    @Body() editOrg: EditOrganizationDto,
    @Param('organizationId') organizationId: string,
  ) {
    const organization = await this.orgRepo.findOne({
      where: { id: organizationId },
    });

    // check if orgaization exist
    if (!organization) {
      throw new BadRequestException(
        AppResponse.badRequest('organization not found'),
      );
    }
    const existedOrg = await this.orgRepo.findOne({
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
    if (organization.type == organizationType.buyer) {
      if (editOrg.apr) {
        organization.apr = editOrg.apr;
      } else {
        const apr = this.configService.get<number>(ConfigConstant.APR);
        if (apr) {
          organization.apr = apr;
        }
      }
    }
    if (organization.type == organizationType.supplier) {
      if (editOrg.discountRatio) {
        organization.apr = editOrg.discountRatio;
      }
    }

    await this.orgRepo.update(organization.id, organization);

    return AppResponse.OkSuccess(organization);
  }

  @AllowPermissions(
    SupplierPermissions.addSupplierUser,
    BuyerPermissions.addBuyerUser,
  )
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
    const existedOrg = await this.orgRepo.find({
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

    if (org.type == organizationType.supplier) {
      org.parentId = organization.id;
    }
    if (org.type == organizationType.buyer) {
      if (createUserOrg.organization.apr) {
        org.apr = createUserOrg.organization.apr;
      } else {
        const apr = this.configService.get<number>(ConfigConstant.APR);
        if (apr) {
          org.apr = apr;
        }
      }
    }
    await this.orgRepo.insert(org);

    user.organization = org;
    user.role = role;
    await this.userRepo.insert(user);

    const createByOrgan = await this.orgRepo.findOne({
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
    const expiresIn = this.appService.generateInvitationExpireTime().toDate();
    const invitation = {
      invitedByUser: currentUser, // update to current loggedin user
      confirmationType: rolename,
      organization: org,
      status: invitationStatus.pending,
      user: user,
      ExpiresIn: expiresIn,
    } as Invitation;
    await this.invitationRepo.save(invitation);
    // todo send email to this user with invitation link]
    const inviteUrl =
      this.configService.get(ConfigConstant.frontendUrl) +
      'join/?inviteId=' +
      invitation.id;
    // const message = `Hello You have been invited to Verify and Activate your account
    //   <br> click the click below <a href=${inviteUrl}>Activate account</a>
    // `;
    const link = `<a href=${inviteUrl}>${inviteUrl}</a>`;
    let inviteName = organization.name;
    if (rolename == roleTypes.buyerAdmin) {
      inviteName = org.name;
    }
    const message = getWelcomeMessage(
      user.firstName + ' ' + user.lastName,
      link,
      rolename,
      inviteName,
      '',
      currentUser.firstName + ' ' + currentUser.lastName,
    );
    const template = getTemplate(message);
    const emailMessage: EmailDto = {
      to: [user.email],
      body: template,
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

    const role = await this.roleRepo.findOne({
      where: { id: createUser.role },
    });

    if (!role) {
      throw new BadRequestException(AppResponse.badRequest('role not found'));
    }
    user.role = role;
    user.organization = org;
    const otp = GenerateRandom(10315, 99929);
    user.otp = otp;
    const expiretime = moment().add(20, 'minutes');
    user.otpExpiresIn = expiretime.toDate();
    await this.userRepo.insert(user);
    const expiresIn = this.appService.generateInvitationExpireTime().toDate();
    const invitation = {
      invitedByUser: currentUser, // update to current loggedin user
      confirmationType: role.type,
      organization: org,
      status: invitationStatus.pending,
      user: user,
      ExpiresIn: expiresIn,
    } as Invitation;
    await this.invitationRepo.save(invitation);
    // todo send email to this user with invitation link]

    if (org.status == statusConstant.active) {
      //  create otp and send the user
      const inviteUrl =
        this.configService.get(ConfigConstant.frontendUrl) +
        `auth/activate/${user.id}/?inviteId=${invitation.id}`;

      const moreInfo = `Activate your account with this Otp : <b>${otp}</b>
     `;
      const link = `<a href=${inviteUrl}>${inviteUrl}</a>`;
      const message = getWelcomeMessage(
        user.firstName + ' ' + user.lastName,
        link,
        user.role.type,
        org.name,
        moreInfo,
        currentUser.firstName + ' ' + currentUser.lastName,
      );
      const template = getTemplate(message);
      const emailMessage: EmailDto = {
        to: [user.email],
        body: template,
        subject: 'Activate your Account',
      };
      this.emailSerice.sendEmail(emailMessage).subscribe(d => console.log(d));
    } else {
      if (role.type == roleTypes.admin) {
        const inviteUrl =
          this.configService.get(ConfigConstant.frontendUrl) +
          `join/?inviteId=${invitation.id}`;

        const link = `<a href=${inviteUrl}>${inviteUrl}</a>`;
        const message = getWelcomeMessage(
          user.firstName + ' ' + user.lastName,
          link,
          user.role.type,
          org.name,
          ' ',
          currentUser.firstName + ' ' + currentUser.lastName,
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

    return AppResponse.OkSuccess({});
  }

  @AllowPermissions(
    SupplierPermissions.editSuppier,

    BuyerPermissions.editBuyer,
  )
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
  @AllowPermissions(BuyerPermissions.viewSuppliers)
  @Get('suppliers/buyer/:buyerId')
  async mySupplier(@Param('buyerId') buyerId: string) {
    const suppliers = await this.orgRepo.find({
      where: { parentId: buyerId },
    });
    return AppResponse.OkSuccess(suppliers);
  }

  @AllowPermissions(SupplierPermissions.listSuppier)
  @Get('suppliers')
  async GetSupplier(@Query() filters: OrganizationFilter) {
    const where: FindConditions<Organization> = {
      type: organizationType.supplier,
    };
    if (filters.search) {
      where.name = Like(`%${filters.search}%`);
    }
    const buyer = await this.orgRepo.find({
      where: where,
    });

    return AppResponse.OkSuccess(buyer);
  }

  @AllowPermissions(BuyerPermissions.listBuyer)
  @Get('buyers')
  async GetBuyers(@Query() filters: OrganizationFilter) {
    const where: FindConditions<Organization> = {
      type: organizationType.buyer,
    };
    if (filters.search) {
      where.name = Like(`%${filters.search}%`);
    }
    const buyers = await this.orgRepo.find({
      where: where,
    });
    return AppResponse.OkSuccess(buyers);
  }

  @AllowPermissions(SupplierPermissions.viewBuyers, BuyerPermissions.listBuyer)
  //get all buyers a supplier belongs to
  @Get('buyers/supplier/:supplierId')
  async GetBuyerSupplier(@Param('supplierId') supplierId: string) {
    const buyers = await this.orgRepo.find({
      where: { parentId: supplierId },
    });

    return AppResponse.OkSuccess(buyers);
  }

  @ApiHeader({
    name: 'organizationId',
    description: 'provide organization id',
  })
  @AllowPermissions(UserPermissions.view, UserPermissions.list)
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

  @AllowPermissions(UserPermissions.view)
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
      permissions: result.role.permission,
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

  @AllowPermissions(SupplierPermissions.viewBuyers, BuyerPermissions.ViewBuyer)
  @Get(':organizationId')
  async Get(@Param('organizationId') organizationId: string) {
    const organization = await this.orgRepo.findOne({
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
