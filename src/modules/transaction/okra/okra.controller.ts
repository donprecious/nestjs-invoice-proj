import { Body, Controller, Get, HttpService, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { BankTransactions } from 'src/entities/banktransaction.entity';
import { OrganizationRepository } from 'src/repositories/organization/organizationRepository';
import { BankTransactionRepository } from 'src/repositories/BankTransaction/bankTransactionRepository';
import { ConfigConstant } from 'src/shared/constants/ConfigConstant';
import { AppResponse } from 'src/shared/helpers/appresponse';
import { OkraService } from '../okra.service';

@Controller('okra')
@ApiTags('okra')
export class OkraController {
  /**
   *
   */
  constructor(
    private bankTransactionRepo: BankTransactionRepository,
    private httpService: HttpService,
    private config: ConfigService,
    private orgRep: OrganizationRepository,
    private okraService: OkraService
  ) {}
  @Get('callback')
  async callBack(
    @Query('record') record: string,
    @Query('method') method: string,
    @Query('organizationId') organizationId: string,
  ) {
    // call request
    const okraKey = this.config.get(ConfigConstant.okraKey);
    const org = await this.orgRep.findOne({ where: { id: organizationId } });
    const response = await this.httpService
      .get(
        `https://api.okra.ng/sandbox/v1/callback?record=${record}&method=${method}`,
        {
          headers: {
            Authorization: ' Bearer ' + okraKey,
          },
        },
      )
      .toPromise();

    const okraData = {} as BankTransactions;
    if (response.status == 200) {
      okraData.provider = 'OKRA';
      okraData.recordId = record;
      okraData.recordType = method;
      okraData.data = response.data.data;
      if (org) {
        okraData.organization = org;
      }
      await this.bankTransactionRepo.save(okraData);
    }
    return AppResponse.OkSuccess(okraData);
  }

  @Post('callback/:organizationID')
  async okraCallback(
    @Param('organizationID') organizationId: string,
    @Body('method') method: string,
    @Body('callback_url') callbackUrl: string,
    @Body('callback_code') callbackCode: string,
    @Body('record') record: string
    ){
   return await this.okraService.okraCallback(
      organizationId,
      method,
      callbackUrl,
      callbackCode,
      record
      );
      
  }
}
