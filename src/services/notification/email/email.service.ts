import { EmailDto } from '../../../shared/dto/emailDto';
import { ConfigConstant } from './../../../shared/constants/ConfigConstant';
import { ConfigService } from '@nestjs/config';
import { HttpService, Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

@Injectable()
export class EmailService {
  /**
   *
   */
  constructor(private http: HttpService, private configService: ConfigService) {
    
    
  } 

  sendEmail(emailDto: EmailDto) {
    const url = this.configService.get(ConfigConstant.emailService.baseUrl) + "email/"+ randomBytes(10).toString('hex');
    const apikey = this.configService.get(ConfigConstant.emailService.apiKey) ;
    const clientId  = this.configService.get(ConfigConstant.appId); 
   return  this.http.post(url, emailDto, { headers: {
      'method': 'sendgrid',
      'client-id': clientId,
      'api-key': apikey
    } });
  }
}
