import { Injectable } from '@nestjs/common';
import _ = require('lodash');
import moment = require('moment');
import { Invoice } from 'src/entities/invoice.entity';
import { Organization } from 'src/entities/organization.entity';
import { invoiceStatus } from 'src/shared/app/invoiceStatus';
import { OrganizationTypeEnum } from 'src/shared/app/organizationType';
import { getDateFromFilter } from 'src/shared/helpers/dateUtility';
import { FindConditions, Between } from 'typeorm';
import { InvoiceRepository } from './invoice';

@Injectable()
export class InvoiceService {
  constructor(private invoiceRepo: InvoiceRepository) {}

  async GetInvoiceOverview(
    orgType: OrganizationTypeEnum,
    organization: Organization = null,
    dateFilter: string = null,
  ) {
    let count = 0;
    let totalDiscountAmountSum = 0;
    let invoice: Invoice[] = [];

    const dateDuration = getDateFromFilter(dateFilter);
    const where: FindConditions<Invoice> = {
      createdOn: Between(dateDuration.from.toDate(), dateDuration.to.toDate()),
    };

    if (orgType == OrganizationTypeEnum.Buyer) {
      where.createdByOrganization = organization;
      count = await this.invoiceRepo.count({
        where: where,
      });
      invoice = await this.invoiceRepo.find({
        select: ['discountAmount'],
        where: where,
      });
    }
    if (orgType == OrganizationTypeEnum.Supplier) {
      where.createdForOrganization = organization;
      count = await this.invoiceRepo.count({
        where: where,
      });
      invoice = await this.invoiceRepo.find({
        select: ['discountAmount'],
        where: where,
      });
    }
    if (orgType == OrganizationTypeEnum.Admin) {
      count = await this.invoiceRepo.count({ where: where });
      invoice = await this.invoiceRepo.find({
        select: ['discountAmount'],
        where: where,
      });
    }
    console.log('discountAmount', invoice);
    totalDiscountAmountSum = _.sumBy(invoice, a => Number(a.discountAmount));

    const res = {
      valueOfInvoice: totalDiscountAmountSum,
      numberOfInvoice: count,
    };
    return res;
  }

  async ComputeInvoiceDiscountAmount(
    invoiceNumber: string,
    status: string,
    buyerApr: number,
    buyer: Organization,
  ) {
    const invoice = await this.invoiceRepo.findOne({
      where: { invoiceNumber: invoiceNumber, createdByOrganization: buyer },
      relations: ['createdByOrganization', 'createdForOrganization'],
    });
    if (!invoice) {
      console.log('invoice not found');
      return;
    }

    const supplier = invoice.createdForOrganization;

    const supplierApr =
      supplier.apr > 0 ? buyerApr - (supplier.apr / 100) * buyerApr : buyerApr;

    let daysOutstanding = 0;
    const creationDate = moment(invoice.createdOn);

    if (status == invoiceStatus.pending || status == invoiceStatus.accepted) {
      const duration = moment
        .duration(moment(invoice.dueDate).diff(creationDate))
        .asDays();
      daysOutstanding = Math.abs(duration);
    } else {
      const duration = moment
        .duration(moment(invoice.dueDate).diff(moment(invoice.paymentDate)))
        .asDays();
      daysOutstanding = Math.abs(duration);
    }
    const discountAmount =
      invoice.amount -
      invoice.amount * (daysOutstanding / 365) * (supplierApr / 100);
    invoice.discountAmount = discountAmount;
    console.log(
      'computed discount amout is ' +
        discountAmount +
        ' with duration ' +
        daysOutstanding,
    );
    this.invoiceRepo.update(invoice.id, invoice);
    return invoice;
  }

  async ComputeInvoiceDiscount(invoiceId, status: string) {
    const invoice = await this.invoiceRepo.findOne({
      where: { id: invoiceId },
      relations: ['createdByOrganization', 'createdForOrganization'],
    });
    if (!invoice) return;

    const buyer = invoice.createdByOrganization;
    const supplier = invoice.createdForOrganization;
    let daysOutstanding = 0;
    const creationDate = moment(invoice.createdOn);

    if (status == invoiceStatus.pending || status == invoiceStatus.accepted) {
      const duration = moment
        .duration(moment(invoice.dueDate).diff(creationDate))
        .asDays();
      daysOutstanding = Math.abs(duration);
    } else {
      const duration = moment
        .duration(moment(invoice.paymentDate).diff(creationDate))
        .asDays();
      daysOutstanding = Math.abs(duration);
    }
    const discountAmount =
      invoice.amount -
      invoice.amount * (daysOutstanding / 365) * (Number(supplier.apr) / 100);
    invoice.discountAmount = discountAmount;
    this.invoiceRepo.update(invoice.id, invoice);
    return invoice;
  }
}
