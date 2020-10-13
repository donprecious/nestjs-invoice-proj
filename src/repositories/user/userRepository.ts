import { User } from '../../entities/User.entity';
import { Repository, EntityRepository } from 'typeorm';
import moment = require('moment');
import { GenerateRandom } from 'src/shared/helpers/utility';

@EntityRepository(User)
export class UserRepository extends Repository<User> {}
