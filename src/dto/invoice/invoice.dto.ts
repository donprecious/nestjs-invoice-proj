import { invoiceStatus } from './../../shared/app/invoiceStatus';
import { OrganizationDto } from './../organization/organization.dto';
import { IsDate, IsIn, IsNotEmpty, IsNumber } from 'class-validator';
import { EntityDto } from './../entityDto.shated';
import { OrganizationTypeEnum } from 'src/shared/app/organizationType';

export class InvoiceDto extends EntityDto {
  @IsNotEmpty()
  invoiceNumber: string;

  @IsNotEmpty()
  currencyCode: string;

  @IsNumber()
  amount: number;

  discountAmount: number;

  @IsDate()
  dueDate: Date;

  supplier: OrganizationDto;

  paymentReference: string;
  paymentDate: Date;

  createdForOrganization: OrganizationDto;
  createdByOrganization: OrganizationDto;
}

export class InvoiceParameter {
  @IsIn([
    OrganizationTypeEnum.Admin,
    OrganizationTypeEnum.Supplier,
    OrganizationTypeEnum.Buyer,
  ])
  type: OrganizationTypeEnum;
  value: string;
}

export class UpdateInvoiceDto {
  invoiceNumber: string;

  currencyCode: string;

  amount: number;

  dueDate: Date;

  discountAmount: number;

  paymentReference: string;

  paymentDate: Date;

  @IsIn([
    invoiceStatus.accepted,
    invoiceStatus.outstanding,
    invoiceStatus.overdue,
    invoiceStatus.paid,
    invoiceStatus.pending,
    invoiceStatus.settled,
  ])
  status: string;
}
