import { IsEmail } from 'class-validator';
import { UserOrganizationRepository } from './../../../services/organization/organizationService';
import { LoginDto } from './../../../dto/auth/login.dto';
import { UserRepository } from './../../../services/user/userService';
import { ApiTags } from '@nestjs/swagger/dist/decorators';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { SetupUserDto } from 'src/dto/user/setup-user.dto';

import { AppResponse } from 'src/shared/helpers/appresponse';
import { compare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import moment = require('moment');

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private userRepo: UserRepository,
    private jwtService: JwtService,
    private userOrg: UserOrganizationRepository,
  ) {}

  @Post('/activate')
  async activate(@Body() detail: SetupUserDto) {
    //  todo validate otp
    const findUser = await this.userRepo.findOne({
      where: { id: detail.userId },
    });
    if (!findUser) {
      throw new BadRequestException(AppResponse.badRequest('user not found'));
    }
    const hashedPassword = await hash(detail.password, 10);
    findUser.passwordHash = hashedPassword;
    this.userRepo.update(findUser.id, findUser);
    return AppResponse.OkSuccess(detail, 'user activated');
  }

  @Post('login') async Login(@Body() loginDto: LoginDto) {
    const findUser = await this.userRepo.findOne({
      where: { email: loginDto.email },
      relations: [
        'userOrganization',
        'userRoles',
        'userOrganization.organization',
        'userRoles.role',
      ],
    });
    if (!findUser) {
      throw new BadRequestException(
        AppResponse.badRequest('invalid login details'),
      );
    }
    const orgs = findUser.userOrganization.map(a => a.organization.name);
    const roles = findUser.userRoles.map(a => {
      const rol = {
        name: a.role.Name,
        permissions: a.role.permission,
      };
      return rol;
    });

    const isCorrect = compare(loginDto.password, findUser.passwordHash);
    if (!isCorrect) {
      throw new BadRequestException(
        AppResponse.badRequest('invalid login details'),
      );
    }

    const payload = {
      sub: findUser.id,
      email: findUser.email,
      firstName: findUser.firstName,
      lastName: findUser.lastName,
      organization: [...orgs],
      role: [...roles],
    };
    // generate token here
    const token = this.jwtService.sign(payload);
    return AppResponse.OkSuccess({ token, payload });
  }

  @Get('password/forgot/:email')
  async forgetPassword(@Param('email') email: string) {
    const findUser = await this.userRepo.findOne({
      where: { email: email },
    });
    if (!findUser) {
      return AppResponse.OkSuccess(
        null,
        'email sent!, if you have an account with us, you will recieve it ',
      );
    }
    const token = randomBytes(20).toString('hex');
    findUser.resetPasswordToken = token ; 
    const time = moment().add(5, 'minutes')
    return token;
  }
}