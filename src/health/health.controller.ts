import { AppResponse } from './../shared/helpers/appresponse';
import { ApiTags } from '@nestjs/swagger/dist/decorators';
import { Controller, Get } from '@nestjs/common';
import {
  DNSHealthIndicator,
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

@ApiTags('health')
@Controller('health')
export class HealthController {
  /**
   *
   */
  constructor(
    private health: HealthCheckService,
  ) // private dns: DNSHealthIndicator,
  // private db: TypeOrmHealthIndicator,
  {}

  @Get()
  @HealthCheck()
  check() {
    // return this.health.check([
    //   // () => this.dns.pingCheck('nestjs-docs', 'https://docs.nestjs.com'),
    //   // () => this.db.pingCheck('database', { timeout: 300 }),
    // ]);
    return AppResponse.OkSuccess({}, 'everything seems ok');
  }
}
