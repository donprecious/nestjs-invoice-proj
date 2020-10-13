import { organizationType } from './../../shared/app/organizationType';
import { Between } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Organization } from 'src/entities/organization.entity';
import { OrganizationTypeEnum } from 'src/shared/app/organizationType';
import { ConfigConstant } from 'src/shared/constants/ConfigConstant';
import { getDateFromFilter } from 'src/shared/helpers/dateUtility';
import {
  OrganizationRepository,
  OrganizationInviteRepository,
} from '../../repositories/organization/organizationRepository';

@Injectable()
export class OrganizationService {
  constructor(
    private config: ConfigService,
    private orgRepo: OrganizationRepository,
    private orgInvite: OrganizationInviteRepository,
  ) {}

  async ComputeSupplierApr(
    supplierId,
    discountRatio?: number,
  ): Promise<number> {
    console.log(this.orgRepo);
    const supplier = await this.orgRepo.findOne({ where: { id: supplierId } });
    if (!supplier) return;
    // find buyer
    if (!supplier.parentId) return;
    const buyer = await this.orgRepo.findOne({
      where: { parentId: supplier.parentId },
    });
    if (!buyer) return;
    let buyerApr = buyer.apr;
    if (!buyerApr) {
      buyerApr = this.config.get<number>(ConfigConstant.APR);
    }
    let supplierApr = buyerApr;
    if (discountRatio || discountRatio != 0) {
      supplierApr = buyerApr - (discountRatio / 100) * buyerApr;
    }
    supplier.apr = supplierApr;
    await this.orgRepo.update(supplier.id, supplier);
    return supplierApr;
  }

  async GetRelatedOrg(
    orgType: OrganizationTypeEnum,
    organization: Organization = null,
    dateFilter: string = null,
  ) {
    const dateDuration = getDateFromFilter(dateFilter);

    let totalCount = 0.0,
      numberOfSuppliers = 0.0,
      numberOfBuyers = 0.0;
    if (orgType == OrganizationTypeEnum.Admin) {
      totalCount = await this.orgRepo.count({
        where: {
          createdOn: Between(
            dateDuration.from.toDate(),
            dateDuration.to.toDate(),
          ),
        },
      });
      numberOfSuppliers = await this.orgRepo.count({
        where: {
          createdOn: Between(
            dateDuration.from.toDate(),
            dateDuration.to.toDate(),
          ),
          type: organizationType.supplier,
        },
      });
      numberOfBuyers = await this.orgRepo.count({
        where: {
          createdOn: Between(
            dateDuration.from.toDate(),
            dateDuration.to.toDate(),
          ),
          type: organizationType.buyer,
        },
      });
    }
    if (orgType == OrganizationTypeEnum.Buyer) {
      numberOfSuppliers = await this.orgRepo.count({
        where: {
          createdOn: Between(
            dateDuration.from.toDate(),
            dateDuration.to.toDate(),
          ),
          type: organizationType.supplier,
          parentId: organization?.id,
        },
      });
      totalCount = numberOfSuppliers;
    }

    if (orgType == OrganizationTypeEnum.Supplier) {
      numberOfBuyers = await this.orgInvite.count({
        where: {
          createdOn: Between(
            dateDuration.from.toDate(),
            dateDuration.to.toDate(),
          ),
          inviteeOrganization: organization,
        },
      });
      totalCount = numberOfBuyers;
    }
    const res = {
      totalOrgCount: totalCount,
      numberOfSuppliers,
      numberOfBuyers,
    };
    return res;
  }
}
