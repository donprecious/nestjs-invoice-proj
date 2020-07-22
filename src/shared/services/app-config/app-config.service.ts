import { ConfigConstant } from './../../constants/ConfigConstant';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  /**
   *
   */

  constructor(private configService: ConfigService) {}

  getValue(key: string): string {
    return this.configService.get<string>(key);
  }
}
