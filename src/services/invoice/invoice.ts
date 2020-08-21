import { Organization } from './../../entities/organization.entity';
import { Invoice } from './../../entities/invoice.entity';

import { Repository, EntityRepository, FindConditions, Not } from 'typeorm';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { OrganizationTypeEnum } from 'src/shared/app/organizationType';
import * as _ from 'lodash';
@EntityRepository(Invoice)
export class InvoiceRepository extends Repository<Invoice> {
  constructor() {
    super();
  }

  async paginate(options: IPaginationOptions): Promise<Pagination<Invoice>> {
    return paginate<Invoice>(this, options);
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
      count = await this.count({
       
      });
      invoice = await this.find({
        select: ['discountAmount'],
    
      });
    }
    console.log('discountAmount', invoice);
    totalDiscountAmountSum = _.sumBy(invoice, a => Number(a.discountAmount));

    const res = { totalDiscountAmountSum, count };
    return res;
  }
}
