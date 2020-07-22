import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { InvoiceController } from './invoice/invoice.controller';

@Module({
  imports: [SharedModule],
  controllers: [InvoiceController],
})
export class InvoiceModule {}
