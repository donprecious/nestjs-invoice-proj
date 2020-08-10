import { User } from './../../entities/User.entity';
import { Role } from './../../entities/Role.entity';
import { Repository, EntityRepository } from 'typeorm';

@EntityRepository(Role)
export class RoleRepository extends Repository<Role> {}

// @EntityRepository(UserRole)
// export class UserRoleRepository extends Repository<UserRole> {

// }
