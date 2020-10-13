import { HttpService, Injectable } from '@nestjs/common';
import { BankTransactionRepository } from 'src/repositories/BankTransaction/bankTransactionRepository';
import { AppResponse } from 'src/shared/helpers/appresponse';
import { BankTransactions } from 'src/entities/banktransaction.entity';
import { okraCallbackConstants } from 'src/shared/app/okraConstants';
import { ConfigService } from '@nestjs/config';
import { ConfigConstant } from 'src/shared/constants/ConfigConstant';
import { OrganizationRepository } from 'src/repositories/organization/organizationRepository';

@Injectable()
export class OkraService {
  constructor(
    private bankTransactionRepo: BankTransactionRepository,
    private httpService: HttpService,
    private config: ConfigService,
    private organizationRepo: OrganizationRepository,
  ) {}

  async okraCallback(
    organizationId: string,
    method: string,
    callbackUrl: string,
    callbackCode: string,
    record: string,
  ) {
    if (
      callbackCode !== okraCallbackConstants.PRODUCT_IS_READY &&
      callbackCode !== okraCallbackConstants.INITIAL_TRANSACTION
    ) {
      return AppResponse.OkSuccess({
        callbackCode,
        message: 'Transaction not completed',
      });
    }
    const organization = await this.organizationRepo.findOne({
      where: { id: organizationId },
    });
    const okraKey = this.config.get(ConfigConstant.okraKey);
    const response = await this.httpService
      .get(callbackUrl, {
        headers: {
          Authorization: 'Bearer ' + okraKey,
        },
      })
      .toPromise();
    const existingTransaction = await this.bankTransactionRepo.findOne({
      where: { recordId: record },
    });
    const bankTransaction = existingTransaction || ({} as BankTransactions);
    bankTransaction.recordType = method;
    bankTransaction.recordId = record;
    bankTransaction.data = response.data.data;
    bankTransaction.organization = organization;

    await this.bankTransactionRepo.save(bankTransaction);

    return AppResponse.OkSuccess(bankTransaction);
  }
}
