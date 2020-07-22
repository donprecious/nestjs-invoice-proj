import { Invoice } from './../../entities/invoice.entity';

import { Repository, EntityRepository } from 'typeorm';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';

@EntityRepository(Invoice)
export class InvoiceRepository extends Repository<Invoice> {
  constructor() {
    super();
  }

  async paginate(options: IPaginationOptions): Promise<Pagination<Invoice>> {
    return paginate<Invoice>(this, options);
  }
}
