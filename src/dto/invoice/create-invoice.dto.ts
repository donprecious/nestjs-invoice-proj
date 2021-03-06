import {
  IsDateString,
  isNotEmpty,
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

export class CreateSingleInvoiceDto {
  @IsNotEmpty()
  invoiceNumber: string;

  @IsNotEmpty()
  currencyCode: string;

  @IsNumber()
  amount: number;

  @IsDateString()
  dueDate: Date;

  @IsNotEmpty()
  supplierCode: string;
}

export class CreateManyInvoiceDto {
  @ValidateNested()
  @Type(() => CreateSingleInvoiceDto)
  invoices: CreateSingleInvoiceDto[];
}

export class CreateManyInvoiceBySupplierDto {
  @ValidateNested()
  @Type(() => CreateInvoiceDto)
  invoices: CreateInvoiceDto[];

  @IsNotEmpty()
  supplierId: string;
}

export class InvoiceFilter {
  invoiceNumber?: string;

  fromAmount?: number;
  toAmount?: number;
  amount?: number;

  fromDiscountAmount?: number;
  toDiscountAmount?: number;
  discountAmount?: number;

  fromDueDate?: Date;
  toDueDate?: Date;

  fromPaymentDate?: Date;
  toPaymentDate?: Date;

  supplierCode?: string;
  buyerCode?: string;
  supplierName?: string;
  buyerName?: string;

  status?: string;

  expiring?: number;
}
