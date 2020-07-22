import { JwtPayloadDto } from './../../shared/dto/jwt.dto';
import { ConfigConstant } from './../../shared/constants/ConfigConstant';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configservice: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configservice.get(ConfigConstant.jwtSecret),
    });
  }

  validate(payload: any): JwtPayloadDto {
    return payload as JwtPayloadDto;
  }
}
