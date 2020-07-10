import { RoleRepository } from './../../services/role/roleService';

import { Injectable } from '@nestjs/common';
import { permissionTypes } from 'src/shared/app/permissionsType';

import { roleTypes } from 'src/shared/app/roleTypes';
import { Role } from 'src/entities/Role.entity';

@Injectable()
export class SeederService {
  constructor(private roleRepo: RoleRepository) {}

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
      },
      {
        Name: roleTypes.buyer,
        permission: [permissionTypes.read],
      },
      {
        Name: roleTypes.supplier,
        permission: [permissionTypes.read],
      },
      {
        Name: roleTypes.buyerAdmin,
        permission: [
          permissionTypes.create,
          permissionTypes.delete,
          permissionTypes.read,
          permissionTypes.update,
        ],
      },
      {
        Name: roleTypes.supplierAdmin,
        permission: [
          permissionTypes.create,
          permissionTypes.delete,
          permissionTypes.read,
          permissionTypes.update,
        ],
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
