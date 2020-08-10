import { Role } from './../../../entities/Role.entity';
import { AppService } from 'src/services/app/app.service';
import { GetRoleDto } from './../../../dto/role/role.dto';
import {
  OrganizationDto,
  OrganizationPayloadDto,
} from './../../../dto/organization/organization.dto';
import { JwtPayloadDto } from './../../../shared/dto/jwt.dto';
import { EmailDto } from '../../../shared/dto/emailDto';
import { ConfigConstant } from './../../../shared/constants/ConfigConstant';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './../../../services/notification/email/email.service';
import { ResetPasswordDto } from './../../../dto/auth/reset-password.dto';
import { IsEmail } from 'class-validator';

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
  UseGuards,
  Request,
  ValidationPipe,
} from '@nestjs/common';
import { SetupUserDto } from 'src/dto/user/setup-user.dto';

import { AppResponse } from 'src/shared/helpers/appresponse';
import { compare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import moment = require('moment');
import { Timestamp } from 'typeorm';
import { async } from 'rxjs/internal/scheduler/async';
import { JwtAuthGuard } from './jwtauth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private userRepo: UserRepository,
    private jwtService: JwtService,

    private emailSerice: EmailService,
    private configService: ConfigService,
    private appService: AppService,
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

    if (findUser.otp !== detail.otp) {
      throw new BadRequestException(
        AppResponse.badRequest('invalid or expired otp'),
      );
    }

    const hasExpired = moment().isAfter(findUser.otpExpiresIn);
    if (hasExpired) {
      throw new BadRequestException(
        AppResponse.badRequest('invalid or expired otp'),
      );
    }

    const hashedPassword = await hash(detail.password, 10);
    findUser.passwordHash = hashedPassword;
    findUser.otp = null;
    findUser.otpExpiresIn = null;
    this.userRepo.update(findUser.id, findUser);

    return AppResponse.OkSuccess(detail, 'user activated');
  }

  @Post('login') async Login(@Body() loginDto: LoginDto) {
      const findUser = await this.userRepo.findOne({
        where: { email: loginDto.email },
        relations: ['organization', 'role'],
      });
      if (!findUser) {
        throw new BadRequestException(
          AppResponse.badRequest('invalid login details'),
        );
      }
      const orgs = findUser.organization as  OrganizationPayloadDto; 
      const role = findUser.role as unknown as GetRoleDto; 

      const isCorrect = await compare(loginDto.password, findUser.passwordHash);
      if (!isCorrect) {
        throw new BadRequestException(
          AppResponse.badRequest('invalid login details'),
        );
      }

    const payload = {
      sub: findUser.id,
      email: findUser.email,
      firstname: findUser.firstName,
      lastname: findUser.lastName,
      userId: findUser.id,
      organization: orgs,
      role: role
    } as JwtPayloadDto;
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
    findUser.resetPasswordToken = token;
    const time = moment().add(20, 'minutes');
    findUser.resetPasswordTokenExpire = time.toDate();
    this.userRepo.update(findUser.id, findUser);

    //todo send email
    const forgetPasswordUrl =
      this.configService.get(ConfigConstant.frontendUrl) +
      `forgotpasword/?email=${findUser.email}&token=${token}`;
    const message = `Hello, you have initiated a password reset , if you didnt ignore 
      otherwise 
      <br> click the click below <a href='${forgetPasswordUrl}'>reset password</a>
    `;
    const emailMessage: EmailDto = {
      to: [findUser.email],
      body: message,
      subject: 'reset password',
    };
    this.emailSerice.sendEmail(emailMessage).subscribe(d => console.log(d));
    return AppResponse.OkSuccess(
      null,
      'email sent!, if you have an account with us, you will recieve it ',
    );
  }

  @Post('password/reset')
  async resetPassword(@Body() resetPassword: ResetPasswordDto) {
    const findUser = await this.userRepo.findOne({
      where: { email: resetPassword.email },
    });
    if (!findUser) {
      return AppResponse.OkFailure(null, 'invalid or expired token');
    }
    // check token lifetime
    if (findUser.resetPasswordToken != resetPassword.token) {
      throw new BadRequestException(
        AppResponse.badRequest('invalid or expired token'),
      );
    }
    const hasExpired = moment().isAfter(findUser.resetPasswordTokenExpire);
    if (hasExpired) {
      throw new BadRequestException(
        AppResponse.badRequest('invalid or expired token'),
      );
    }
    const hashedPassword = await hash(resetPassword.password, 10);
    findUser.passwordHash = hashedPassword;
    findUser.resetPasswordToken = null;
    findUser.resetPasswordTokenExpire = null;
    this.userRepo.update(findUser.id, findUser);

    return AppResponse.OkSuccess(
      null,
      'password reset successful, login to continue',
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('currentUser')
  async currentUser(@Request() req) {
    // const user = req.user as JwtPayloadDto;
    const user = await this.appService.getLoggedUser();
    return user;
  }
}
