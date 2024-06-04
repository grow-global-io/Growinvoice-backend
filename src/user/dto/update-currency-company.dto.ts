import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class updateCurrencyCompanyDto {
  @IsString()
  @IsNotEmpty()
  currency_id: string;

  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  zipCode: string;

  @IsString()
  @IsOptional()
  vat?: string;

  @IsString()
  @IsOptional()
  logo?: string;
}
