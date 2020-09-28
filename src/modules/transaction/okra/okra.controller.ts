import { Controller, Get, HttpService, Query, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { BankTransactions } from 'src/entities/banktransaction.entity';
import { OrganizationRepository } from 'src/services/organization/organizationService';
import { BankTransactionRepository } from 'src/services/transaction/transaction.service';
import { ConfigConstant } from 'src/shared/constants/ConfigConstant';
import { AppResponse } from 'src/shared/helpers/appresponse';

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
}