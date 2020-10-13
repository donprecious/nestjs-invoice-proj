import { ConfigConstant } from './shared/constants/ConfigConstant';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';

import { ApikeyValidatorService } from './shared/validators/apikey-validator/apikey-validator.service';
import { AuthMiddleware } from './shared/middlewares/auth-middleware/auth-middleware.service';

import { ConfigModule } from '@nestjs/config/dist/config.module';
import { AppConfigService } from './shared/services/app-config/app-config.service';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { Connection } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { OrganizationModule } from './modules/organization/organization.module';
import { SharedModule } from './modules/shared/shared.module';
import { SeederModule } from './seeder/seeder/seeder.module';
import { AutomapperModule } from 'nestjsx-automapper';
import { IdentityModule } from './modules/identity/identity.module';
import { AuthService } from './services/auth/auth.service';
import { EmailService } from './services/notification/email/email.service';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { AppService } from './services/app/app.service';
import { TerminusModule } from '@nestjs/terminus/dist/terminus.module';
import { HealthController } from './health/health.controller';
import { TransactionModule } from './modules/transaction/transaction.module';
import { TransactionService } from './services/transaction/transaction.service';
import { InvoiceService } from './services/invoice/invoice-service.service';
import { UserService } from './services/user/user.service';
import { OkraService } from './modules/transaction/okra.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AutomapperModule.withMapper(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get(ConfigConstant.database.host),
        port: +configService.get<number>(ConfigConstant.database.port),
        username: configService.get(ConfigConstant.database.username),
        password: configService.get(ConfigConstant.database.password),
        database: configService.get(ConfigConstant.database.name),
        entities: ['dist/**/*.entity{.ts,.js}'],
        autoLoadEntities: true,
        logging: true,
      }),
      inject: [ConfigService],
    }),
    SharedModule,
    OrganizationModule,
    SeederModule,
    IdentityModule,
    InvoiceModule,
    TerminusModule,
    TransactionModule,
  ],
  controllers: [HealthController],
  providers: [
    ApikeyValidatorService,
    AuthMiddleware,
    AppConfigService,
    AuthService,
    EmailService,
    TransactionService,
    InvoiceService,
    UserService,
    OkraService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer.apply(AuthMiddleware).forRoutes('**');
  }
  constructor(private connection: Connection) {}
}
