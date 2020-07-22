import { OrganizationDto } from './../organization/organization.dto';
import { IsDate, IsNotEmpty, IsNumber } from 'class-validator';
import { EntityDto } from './../entityDto.shated';

export class InvoiceDto extends EntityDto {
  @IsNotEmpty()
  invoiceNumber: string;

  @IsNotEmpty()
  currencyCode: string;

  @IsNumber()
  amount: number;

  @IsDate()
  dueDate: Date;

  supplier: OrganizationDto;

  createdByOrganization: OrganizationDto;
}
