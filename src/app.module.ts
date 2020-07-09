import { ConfigConstant } from './shared/constants/ConfigConstant';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ApikeyValidatorService } from './shared/validators/apikey-validator/apikey-validator.service';
import { AuthMiddleware } from './shared/middlewares/auth-middleware/auth-middleware.service';

import { ConfigModule } from '@nestjs/config/dist/config.module';
import { AppConfigService } from './shared/services/app-config/app-config.service';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { Connection } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { OrganizationModule } from './modules/organization/organization.module';
import { SharedModule } from './modules/shared/shared.module';

@Module({
  imports: [
    ConfigModule.forRoot(),

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
      }),
      inject: [ConfigService],
    }),
    SharedModule,
    OrganizationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ApikeyValidatorService,
    AuthMiddleware,
    AppConfigService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer.apply(AuthMiddleware).forRoutes('**');
  }
  constructor(private connection: Connection) {}
}
