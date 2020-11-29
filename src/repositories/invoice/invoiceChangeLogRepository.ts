import { InvoiceChangeLog } from 'src/entities/invoiceChangeLog.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(InvoiceChangeLog)
export class InvoiceChangeLogRepository extends Repository<InvoiceChangeLog> {
  constructor() {
    super();
  }
}
