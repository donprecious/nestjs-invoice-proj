import { Type } from 'class-transformer';
import { IsNotEmpty, IsEmail, IsIn } from 'class-validator';
import { Address } from './organization.dto';

export class CreateOrganizationDto {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  code: string;
 
  email: string;

  @IsNotEmpty()
  address: Address;
  @IsNotEmpty()
  phone: string;
  
  bankcode: string;
 
  bankNumber: string;
 
  taxId: string;

  @IsIn(['supplier', 'buyer'])
  @IsNotEmpty()
  type: string;
}

export class EditOrganizationDto {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  code: string;

  email: string;

  @IsNotEmpty()
  address: Address;
  @IsNotEmpty()
  phone: string;

  bankcode: string;

  bankNumber: string;

  taxId: string;

  @IsIn(['active', 'inactive'])
  @IsNotEmpty()
  status: string;
}
