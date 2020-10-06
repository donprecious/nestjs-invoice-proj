import { HttpService, Injectable } from '@nestjs/common';
import { BankTransactionRepository } from 'src/services/transaction/transaction.service';
import { AppResponse } from 'src/shared/helpers/appresponse';
import { BankTransactions } from 'src/entities/banktransaction.entity';
import { okraCallbackConstants } from 'src/shared/app/okraConstants';
import { ConfigService } from '@nestjs/config';
import { ConfigConstant } from 'src/shared/constants/ConfigConstant';
import { OrganizationRepository } from 'src/services/organization/organizationService';

@Injectable()
export class OkraService {
  constructor(
    private bankTransactionRepo: BankTransactionRepository,
    private httpService: HttpService,
    private config: ConfigService,
    private organizationRepo: OrganizationRepository
  ) { }

  async okraCallback(
    organizationId: string,
    method: string,
    callbackUrl: string,
    callbackCode: string,
    record: string) {
    if (callbackCode !== okraCallbackConstants.PRODUCT_IS_READY && callbackCode !== okraCallbackConstants.INITIAL_TRANSACTION){
      return AppResponse.OkSuccess({});
    }
    const organization = await this.organizationRepo.findOne({ where: { id: organizationId } });
    const okraKey = this.config.get(ConfigConstant.okraKey);
    const response = await this.httpService
      .get(
        callbackUrl,
        {
          headers: {
            Authorization: 'Bearer ' + okraKey
          }
        }
      ).toPromise();
    
    const bankTransaction = {} as BankTransactions;
    bankTransaction.recordType = method;
    bankTransaction.recordId = record;
    bankTransaction.data = response.data.data;
    bankTransaction.organization = organization;
    
    await this.bankTransactionRepo.save(bankTransaction);
    
    return AppResponse.OkSuccess(bankTransaction)
  }
}
