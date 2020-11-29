import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { InvoiceController } from './invoice/invoice.controller';
import { InvoiceChangeController } from './invoice-change/invoice-change.controller';

@Module({
  imports: [SharedModule],
  controllers: [InvoiceController, InvoiceChangeController],
})
export class InvoiceModule {}
