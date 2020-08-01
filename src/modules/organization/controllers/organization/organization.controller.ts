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
import { UserRole } from 'src/entities/UserRole.entity';
import { roleTypes } from './../../../../shared/app/roleTypes';
import {
  RoleRepository,
  UserRoleRepository,
} from './../../../../services/role/roleService';
import { UserOrganization } from './../../../../entities/userOrganization.entity';

import { CreateOrganizationUserDto } from 'src/dto/user/create-organization-user.dto';
import {
  OrganizationRepository,
  UserOrganizationRepository,
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
import { PromiseUtils } from 'typeorm';
import { GetRoleDto } from 'src/dto/role/role.dto';
@UseGuards(JwtAuthGuard)
@ApiTags('organization')
@Controller('organization')
export class OrganizationController {
  constructor(
    private orgService: OrganizationRepository,
    private userRepo: UserRepository,
    private userOrgRepo: UserOrganizationRepository,
    private roleRepo: RoleRepository,
    private userRole: UserRoleRepository,
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
    const organization = await this.appService.getOrganization();

    const orgnizationId = organization.id;

    const currentUser = await this.appService.getCurrentUser();

    const org = createOrg as Organization;

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
    let organization = await this.orgService.findOne({
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
    let orgnizationId = req.headers['organization-id'];
    if (orgnizationId) {
      orgnizationId = orgnizationId.toString();

      const organization = await this.orgService.findOne({
        where: { id: orgnizationId },
      });
      if (!organization)
        throw new BadRequestException(
          AppResponse.badRequest('current organization  not found'),
        );
    }

    const currentUser = await this.appService.getCurrentUser();

    const org = createUserOrg.organization as Organization;

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
    await this.userRepo.insert(user);
    const userOrg = {
      user: user,
      organization: org,
    } as UserOrganization;

    await this.userOrgRepo.insert(userOrg);

    let rolename = userOrg.organization.type;
    if (rolename.toLowerCase() == roleTypes.supplier.toLowerCase()) {
      rolename = roleTypes.supplierAdmin;
    } else if (rolename.toLowerCase() == roleTypes.buyer.toLowerCase()) {
      rolename = roleTypes.buyerAdmin;
    }
    const role = await this.roleRepo.findOne({ where: { Name: rolename } });
    if (role) {
      // user.roles = [role];
      await this.userRole.save({ user: user, role: role } as UserRole);
    }

    if (orgnizationId) {
      // find created byUserId
      orgnizationId = orgnizationId.toString();

      const createByOrgan = await this.orgService.findOne({
        where: { id: orgnizationId },
      });
      if (createByOrgan) {
        const orgInvite = {
          invitedByOrganization: createByOrgan,
          inviteeOrganization: org,
        } as OrganizationInvite;
        this.orgInvite.save(orgInvite);
      }
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
    await this.userRepo.insert(user);

    if (role) {
      await this.userRole.save({ user: user, role: role } as UserRole);
    }

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
      const userRolesResult = await this.userRole.find({
        where: {
          user: user,
        },
        relations: ['role'],
      });
      const roles = userRolesResult.map(a => a.role);
      const findRoles = roles.find(a => a.Name == rolename);
      if (!findRoles) {
        const addRole = { user: user, role: role } as UserRole;
        await this.userRole.save(addRole);
        const roleToDelete = userRolesResult.filter(
          a => a.role.Name != rolename,
        );
        if (roleToDelete) {
          await this.userRole.remove(roleToDelete);
        }
      }
    }
    await this.userRepo.update(user.id, user);

    return AppResponse.OkSuccess({}, 'user updated');
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
  async GetSupplier() {
    const buyer = await this.orgService.find({
      where: { type: organizationType.supplier },
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

  @ApiHeader({
    name: 'organizationId',
    description: 'provide organization id',
  })
  @Get('users')
  async GetOrgUsers() {
    const org = await this.appService.getOrganization();

    const userOrg = await this.userOrgRepo.find({
      where: { organization: org },
      relations: ['user', 'user.userRoles', 'user.userRoles.role'],
    });

    const users = userOrg.map(a => {
      const userRole = a.user.userRoles.map(r => {
        const role = {
          Name: r.role.Name,
          Description: r.role.Description,
          Permissions: r.role.permission,
        } as GetRoleDto;
        return role;
      });

      const user = {
        email: a.user.email,
        id: a.user.id,
        firstName: a.user.firstName,
        lastName: a.user.lastName,
        phone: a.user.phone,
        createdOn: a.user.createdOn,
        roles: userRole,
      } as UserDto;
      return user;
    });
    return AppResponse.OkSuccess(users);
  }

  @Get('users/:userId')
  async GetOrgUser(@Param('userId') userId: string) {
    const result = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['userRoles', 'userRoles.role'],
    });

    if (!result) {
      throw new NotFoundException(AppResponse.NotFound());
    }

    const userRole = result.userRoles.map(r => {
      const role = {
        Name: r.role.Name,
        Description: r.role.Description,
        Permissions: r.role.permission,
      } as GetRoleDto;
      return role;
    });
    const user = {
      email: result.email,
      id: result.id,
      firstName: result.firstName,
      lastName: result.lastName,
      phone: result.phone,
      createdOn: result.createdOn,
      roles: userRole,
    } as UserDto;

    return AppResponse.OkSuccess(user);
  } 
  
}
