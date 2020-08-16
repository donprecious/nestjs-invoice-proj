import {
  BuyerPermissions,
  DefaultBuyerPermissions,
  DefaultSupplierPermissions,
  SupplierPermissions,
  DefaultSupplierAdminPermissions,
  DefaultBuyerAdminPermissions,
  DefaultAdminPermission,
} from './../../shared/app/permissionsType';
import { supplier } from './../../shared/oranization/organizationType';
import { OrganizationRole } from './../../entities/organizationRole.entity';

import { ConfigConstant } from 'src/shared/constants/ConfigConstant';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from './../../services/user/userService';
import { OrganizationRepository } from './../../services/organization/organizationService';
import { Organization } from 'src/entities/organization.entity';
import { Type } from 'class-transformer';
import { RoleRepository } from './../../services/role/roleService';

import { Injectable } from '@nestjs/common';

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

    private configService: ConfigService,
  ) {}

  async seed() {
    await this.seedDefaultRoleAndPermission();
    await this.seedOrganization();
    console.log(
      'default supplier admin permissions',
      DefaultSupplierAdminPermissions,
    );
    console.log(
      'default buyer admin permissions',
      DefaultBuyerAdminPermissions,
    );
    console.log('default buyer admin permissions', DefaultAdminPermission);
  }

  async seedOrganization() {
    const email = this.configService.get(ConfigConstant.defaultAdminEmail);
    const password = this.configService.get(ConfigConstant.defaultPassword);
    const passwordHash = await hash(password, 10);
    const findOrg = await this.orgRepo.findOne({ where: { email: email } });
    // todo create default organization
    if (findOrg) return;

    const org = {
      name: 'Front Edge',
      address: {},
      email: email,
      phone: '',
      code: 'FrontEdge 123444',
      type: roleTypes.admin,
      taxId: '11111',
    } as Organization;
    await this.orgRepo.save(org);
    const user = {
      email: 'admin@frontedge.com',
      firstName: 'system_admin',
      lastName: 'system_admin',
      phone: '',
      passwordHash: passwordHash,
    } as User;
    user.organization = org;

    const adminRole = await this.roleRepo.findOne({
      where: { Name: roleTypes.admin },
    });

    user.role = adminRole;
    await this.userRepo.save(user);
    console.log('completed seeding default organization ');
  }

  async seedDefaultRoleAndPermission() {
    console.log('=========adding permissions==========');

    console.log('=========permissions==========');

    const roles = [
      {
        Name: roleTypes.admin,
        permission: DefaultAdminPermission,
        type: roleTypes.admin,
      },
      {
        Name: roleTypes.buyer,
        permission: DefaultBuyerPermissions,
        type: roleTypes.buyer,
      },
      {
        Name: roleTypes.supplier,
        permission: DefaultSupplierPermissions,
        type: roleTypes.supplier,
      },
      {
        Name: roleTypes.buyerAdmin,
        permission: [...DefaultBuyerAdminPermissions],
        type: roleTypes.buyerAdmin,
      },

      {
        Name: roleTypes.supplierAdmin,
        permission: [...DefaultSupplierAdminPermissions],
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
}
