import { Role } from './../../entities/Role.entity';
import { Repository, EntityRepository } from 'typeorm';
import { UserRole } from 'src/entities/UserRole.entity';

@EntityRepository(Role)
export class RoleRepository extends Repository<Role> {}

@EntityRepository(UserRole)
export class UserRoleRepository extends Repository<UserRole> {}
