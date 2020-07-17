import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

export class CreateInvoiceDto {
  @IsNotEmpty()
  invoiceNumber: string;

  @IsNotEmpty()
  currencyCode: string;

  @IsNumber()
  amount: number;

  @IsDateString()
  dueDate: Date;
}

export class CreateManyInvoiceDto {
  @ValidateNested()
  @Type(() => CreateInvoiceDto)
  invoices: CreateInvoiceDto[];

  @IsNotEmpty()
  supplierId: string;

  @IsNotEmpty()
  createdByOrgId: string;
}
