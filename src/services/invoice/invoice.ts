import { Invoice } from './../../entities/invoice.entity';

import { Repository, EntityRepository } from 'typeorm';




@EntityRepository(Invoice)
export class InvoiceRepository extends Repository<Invoice> {
  constructor() {
    super();
  }
}
