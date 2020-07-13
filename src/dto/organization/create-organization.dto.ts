import { IsNotEmpty, IsEmail } from 'class-validator';

export class CreateOrganizationDto {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  code: string;
  @IsEmail()
  email: string;
  @IsNotEmpty()
  address: string;
  @IsNotEmpty()
  phone: string;
  @IsNotEmpty()
  bankname: string;
  @IsNotEmpty()
  bankNumber: string;
  taxId: string;
  @IsNotEmpty()
  type: string;
}
