import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigConstant } from 'src/shared/constants/ConfigConstant';
import { OrganizationRepository } from './organizationService';

@Injectable()
export class OrganizationService {
  constructor(
    private config: ConfigService,
    private orgRepo: OrganizationRepository,
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
}
