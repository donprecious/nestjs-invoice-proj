import { JwtStrategy } from './jwt.strategy';
import { ConfigConstant } from './../../shared/constants/ConfigConstant';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { SharedModule } from './../shared/shared.module';
import { Module } from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { JwtModule } from '@nestjs/jwt/dist/jwt.module';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
@Module({
  controllers: [AuthController],
  imports: [
    SharedModule,
    ConfigModule,
    PassportModule,

    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get(ConfigConstant.jwtSecret),
        signOptions: { expiresIn: '5d' },
        // if you want to use token with expiration date
        // signOptions: {
        //     expiresIn: configService.getNumber('JWT_EXPIRATION_TIME'),
        // },
      }),
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
  ],

  providers: [JwtStrategy],
})
export class IdentityModule {}
