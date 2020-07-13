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
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger/dist/decorators/api-use-tags.decorator';
import { Organization } from 'src/entities/organization.entity';
import { User } from 'src/entities/User.entity';
import { UserRepository } from 'src/services/user/userService';

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
  ) {}

  @Post()
  async create(@Body() createUserOrg: CreateOrganizationUserDto) {
    const org = createUserOrg.orgainzation as Organization;
    const user = createUserOrg.user as User;
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
    } else if (rolename.toLowerCase() == roleTypes.buyerAdmin.toLowerCase()) {
      rolename = roleTypes.buyerAdmin;
    }
    const role = await this.roleRepo.findOne({ where: { Name: rolename } });
    if (role) {
      // user.roles = [role];
      await this.userRole.save({ user: user, role: role } as UserRole);
    }

    if (createUserOrg.createdByOrgId) {
      // find created byUserId
      const createByOrgan = await this.orgService.findOne({
        where: { id: createUserOrg.createdByOrgId },
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
      invitedByUser: user, // update to current loggedin user
      confirmationType: roleTypes.supplierAdmin,
      organization: org,
      status: invitationStatus.pending,
      user: user,
    } as Invitation;
    await this.invitationRepo.save(invitation);
    // todo send email to this user with invitation link
    return AppResponse.OkSuccess(createUserOrg);
  }

}
