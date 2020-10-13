import { ConfigConstant } from 'src/shared/constants/ConfigConstant';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../../repositories/user/userRepository';
import { Injectable } from '@nestjs/common';
import moment = require('moment');
import { User } from 'src/entities/User.entity';
import { GenerateRandom } from 'src/shared/helpers/utility';

@Injectable()
export class UserService {
  /**
   *
   */
  constructor(
    private userRepo: UserRepository,
    private configService: ConfigService,
  ) {}

  async generateOtp(user: User): Promise<number> {
    const otp = GenerateRandom(10315, 99929);
    user.otp = otp;

    const expireinMinitues = this.configService.get<number>(
      ConfigConstant.otpExpireTimeInMintues,
    )
      ? this.configService.get<number>(ConfigConstant.otpExpireTimeInMintues)
      : 10;
    const expiretime = moment().add(expireinMinitues, 'minutes');
    user.otpExpiresIn = expiretime.toDate();

    await this.userRepo.update(user.id, user);
    return otp;
  }
}
