import { Organization } from './../../entities/organization.entity';
import { Invoice } from './../../entities/invoice.entity';

import { Repository, EntityRepository, FindConditions, Not } from 'typeorm';
import { OrganizationTypeEnum } from 'src/shared/app/organizationType';
import * as _ from 'lodash';
import { invoiceStatus } from 'src/shared/app/invoiceStatus';
import moment = require('moment');
import { Injectable } from '@nestjs/common';
@EntityRepository(Invoice)
export class InvoiceRepository extends Repository<Invoice> {
  constructor() {
    super();
  }

  async GetInvoiceOverview(
    orgType: OrganizationTypeEnum,
    organization: Organization = null,
  ) {
    let count = 0;
    let totalDiscountAmountSum = 0;
    let invoice: Invoice[] = [];
    if (orgType == OrganizationTypeEnum.Buyer) {
      count = await this.count({
        where: { createdByOrganization: organization },
      });
      invoice = await this.find({
        select: ['discountAmount'],
        where: { createdByOrganization: organization },
      });
    }
    if (orgType == OrganizationTypeEnum.Supplier) {
      count = await this.count({
        where: { createdForOrganization: organization },
      });
      invoice = await this.find({
        select: ['discountAmount'],
        where: { createdForOrganization: organization },
      });
    }
    if (orgType == OrganizationTypeEnum.Admin) {
      count = await this.count({});
      invoice = await this.find({
        select: ['discountAmount'],
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
}

@Injectable()
export class InvoiceService {
  constructor(private invoiceRepo: InvoiceRepository) {}

  async ComputeInvoiceDiscountAmount(invoiceId, status: string , buyerApr : number) {
    const invoice = await this.invoiceRepo.findOne({
      where: { id: invoiceId },
      relations: ['createdByOrganization', 'createdForOrganization'],
    });
    if (!invoice) return;
    
    const supplier = invoice.createdForOrganization;

    const supplierApr = (supplier.apr > 0 ) ?  (buyerApr - ( (supplier.apr/100) * buyerApr ) ) : buyerApr ; 

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
      (invoice.amount * (daysOutstanding / 365) * (supplierApr / 100));
    invoice.discountAmount = discountAmount;
    console.log("computed discount amout is "+discountAmount + " with duration "+ daysOutstanding );
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
