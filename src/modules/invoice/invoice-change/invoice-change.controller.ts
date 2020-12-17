import { InvoiceChangeLogService } from 'src/services/invoice-change-log/invoice-change-log.service';
import { AppResponse } from 'src/shared/helpers/appresponse';
import { invoiceStatus } from 'src/shared/app/invoiceStatus';
import { InvoiceChangeLog } from './../../../entities/invoiceChangeLog.entity';
import { Between } from 'typeorm';
import { async } from 'rxjs/internal/scheduler/async';
import { InvoiceChangeLogRepository } from './../../../repositories/invoice/invoiceChangeLogRepository';
import { InvoiceRepository } from './../../../repositories/invoice/invoiceRepository';
import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/identity/auth/jwtauth.guard';
import { RolePermissionGuard } from 'src/shared/guards/role-permission.guard';
import moment = require('moment');
import { response } from 'express';

@UseGuards(JwtAuthGuard, RolePermissionGuard)
@ApiTags('invoice-changeLog')
@Controller('invoice-changeLog')
export class InvoiceChangeController {
  constructor(
    private invoiceRepo: InvoiceRepository,
    private invoiceChangeLogRepo: InvoiceChangeLogRepository,
  ) {}

  @Post('expiringByDays')
  async LogExpiringInvoice() {
    const currentDate = moment();
    const in14DaysDate = currentDate.add(14, 'days');

    const duration = Between(
      in14DaysDate.startOf('day').toDate(),
      in14DaysDate.endOf('day').toDate(),
    );
    const expiringInvoices = await this.invoiceRepo.find({
      where: { dueDate: duration, status: invoiceStatus.paid },
      relations: ['createdByOrganization', 'createdForOrganization'],
    });

    const invoiceChangeLogByExpiring = expiringInvoices.map(a => {
      const changeLog = {
        invoiceAmount: a.amount,
        changeAmount: a.amount,
        changeMonth: currentDate.month(),
        changeYear: currentDate.year(),
        invoiceId: a.id,
        invoiceNumber: a.invoiceNumber,
        statusFrom: a.status,
        statusTo: invoiceStatus.expiring,
        changeWeekInYear: currentDate.weeks(),
        discountAmount: a.discountAmount,
        buyerCode: a.createdByOrganization.code,
        supplierCode: a.createdForOrganization.code,
      } as InvoiceChangeLog;
      return changeLog;
    });

    await this.invoiceChangeLogRepo.save(invoiceChangeLogByExpiring);
    return AppResponse.OkSuccess(invoiceChangeLogByExpiring);
  }

  @Get('timeseries')
  async GetInvoiceChangeLogAsTimeseries(@Query('since') since = 10) {
    const current = moment();
    const from = moment().subtract(since, 'days');
    const invoiceLog = await this.invoiceChangeLogRepo
      .createQueryBuilder()
      .select([
        'changeYear',
        'changeWeekInYear',
        'statusTo',
        'SUM(changeAmount) as totalChangeAmount',
      ])
      .where('createdOn BETWEEN :date1 and :date2', {
        date1: from.toDate(),
        date2: current.toDate(),
      })
      .groupBy('changeYear,changeWeekInYear,statusTo')
      .getRawMany();
    console.log(invoiceLog);
    return invoiceLog;
  }
}
