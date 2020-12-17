import { async } from 'rxjs/internal/scheduler/async';
import { invoiceStatus } from './../../shared/app/invoiceStatus';
import { Invoice } from './../../entities/invoice.entity';
import { InvoiceChangeLogRepository } from './../../repositories/invoice/invoiceChangeLogRepository';
import { Injectable } from '@nestjs/common';
import { InvoiceChangeLog } from 'src/entities/invoiceChangeLog.entity';
import moment = require('moment');

@Injectable()
export class InvoiceChangeLogService {
  constructor(private invoiceChangeRepo: InvoiceChangeLogRepository) {}

  async createLogs(oldInvoices: Invoice[]) {
    const invoiceChangeLogs: InvoiceChangeLog[] = [];
    for (const oldInvoice of oldInvoices) {
      let status = oldInvoice.status;

      switch (status) {
        case invoiceStatus.pending:
          status = invoiceStatus.accepted;
          break;
        case invoiceStatus.accepted:
          status = invoiceStatus.paid;
          break;
        case invoiceStatus.paid:
          status = invoiceStatus.settled;
          break;
        case invoiceStatus.overdue:
          status = invoiceStatus.settled;
          break;

        default:
          break;
      }

      const changeLog = {
        invoiceId: oldInvoice.id,
        changeAmount: oldInvoice.amount,
        discountAmount: oldInvoice.discountAmount,
        invoiceNumber: oldInvoice.invoiceNumber,
        changeMonth: moment().month(),
        changeYear: moment().year(),
        changeWeekInYear: moment().weeks(),
        statusFrom: oldInvoice.status,
        statusTo: status,
        invoiceAmount: oldInvoice.amount,
        buyerCode: oldInvoice.createdByOrganization.code,
        supplierCode: oldInvoice.createdForOrganization.code,
      } as InvoiceChangeLog;
      invoiceChangeLogs.push(changeLog);
    }
    await this.invoiceChangeRepo.save(invoiceChangeLogs);
  }
}
