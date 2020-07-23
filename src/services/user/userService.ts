import { User } from './../../entities/User.entity';

import { Repository, EntityRepository } from 'typeorm';
import { Not } from 'typeorm/find-options/operator/Not';
import { In } from 'typeorm/find-options/operator/In';
import { Injectable } from '@nestjs/common';
import { RoleRepository } from '../role/roleService';
import moment = require('moment');
import { GenerateRandom } from 'src/shared/helpers/utility';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async generateOtp(user: User): Promise<number> {
    const otp = GenerateRandom(10315, 99929);
    user.otp = otp;
    const expiretime = moment().add(10, 'minutes');
    user.otpExpiresIn = expiretime.toDate();

    await this.update(user.id, user);
    return otp;
  }
}
