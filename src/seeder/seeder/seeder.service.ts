import { supplier } from './../../shared/oranization/organizationType';
import { OrganizationRole } from './../../entities/organizationRole.entity';
import { UserRole } from './../../entities/UserRole.entity';
import { ConfigConstant } from 'src/shared/constants/ConfigConstant';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from './../../services/user/userService';
import { OrganizationRepository } from './../../services/organization/organizationService';
import { Organization } from 'src/entities/organization.entity';
import { Type } from 'class-transformer';
import {
  RoleRepository,
  UserRoleRepository,
} from './../../services/role/roleService';

import { Injectable } from '@nestjs/common';
import { permissionTypes } from 'src/shared/app/permissionsType';

import { roleTypes } from 'src/shared/app/roleTypes';
import { Role } from 'src/entities/Role.entity';
import { User } from 'src/entities/User.entity';
import { hash } from 'bcrypt';

@Injectable()
export class SeederService {
  constructor(
    private roleRepo: RoleRepository,
    private orgRepo: OrganizationRepository,
    private userRepo: UserRepository,
    private userRoleRepo: UserRoleRepository,
    private configService: ConfigService,
  ) {}

  async seed() {
    console.log('=========adding permissions==========');

    console.log('=========permissions==========');
    
    const roles = [
      {
        Name: roleTypes.admin,
        permission: [
          permissionTypes.create,
          permissionTypes.delete,
          permissionTypes.read,
          permissionTypes.update,
        ],
        type: roleTypes.admin,
      },
      {
        Name: roleTypes.buyer,
        permission: [permissionTypes.read],
        type: roleTypes.buyer,
      },
      {
        Name: roleTypes.supplier,
        permission: [permissionTypes.read],
        type: roleTypes.supplier,
      },
      {
        Name: roleTypes.buyerAdmin,
        permission: [
          permissionTypes.create,
          permissionTypes.delete,
          permissionTypes.read,
          permissionTypes.update,
        ],
        type: roleTypes.buyerAdmin,
      },

      {
        Name: roleTypes.supplierAdmin,
        permission: [
          permissionTypes.create,
          permissionTypes.delete,
          permissionTypes.read,
          permissionTypes.update,
        ],
        type: roleTypes.supplierAdmin,
      },
    ] as Role[]; 

    console.log('seeding role');
    for (const role of roles) {
      const findOne = await this.roleRepo.findOne({
        where: { Name: role.Name },
      });
      if (!findOne) {
        await this.roleRepo.save(role);
      }
    }
    console.log('seeding role complete');
  }

  async seedOrganization() {
    const email = this.configService.get(ConfigConstant.defaultAdminEmail);
    const password = this.configService.get(ConfigConstant.defaultPassword);
    const passwordHash = await hash(password, 10);
    // todo create default organization
    const org = {
      name: 'Front Edge',
      address: {},
      email: email,
      phone: '',
      code: 'FrontEdge 123444',
      type: roleTypes.admin,
    } as Organization;
    await this.orgRepo.save(org);
    const user = {
      email: 'admin@frontedge.com',
      firstName: 'system_admin',
      lastName: 'system_admin',
      phone: '',
      passwordHash: passwordHash,
    } as User;
    await this.userRepo.save(user);

    //todo create a default admin user

    // todo add user to default roles
    const adminRole = await this.roleRepo.findOne({
      where: { Name: roleTypes.admin },
    });
    const userRole = {
      role: adminRole,
      user: user,
    } as UserRole;
    await this.userRoleRepo.save(userRole);
    // const otherRoles = await this.roleRepo.
    // var orgRole = [{
    //   organization : org,
    //   role: adminRole,
    // }] as OrganizationRole[];
    // await this.orgRepo.
    // todo add organization to default role
  }
}
