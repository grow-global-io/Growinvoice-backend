import { OmitType } from '@nestjs/swagger';
import {
  CreateInvoiceDto,
  CreateInvoiceProductsDto,
  UpdateInvoiceDto,
} from '@shared/models';
import { Type } from 'class-transformer';
import { IsArray } from 'class-validator';

class OmitCreateInvoiceProductsDto extends OmitType(CreateInvoiceProductsDto, [
  'invoice_id',
] as const) {
  taxes?: string[];
}

class OmitCreateInvoiceDto extends OmitType(CreateInvoiceDto, [
  'customer_id',
] as const) {
  @IsArray()
  customer_ids?: string[];
}

export class CreateInvoiceWithProducts extends OmitCreateInvoiceDto {
  @Type(() => OmitCreateInvoiceProductsDto)
  product: OmitCreateInvoiceProductsDto[];
}

export class CreateDirectInvoiceWithProducts extends CreateInvoiceDto {
  @IsArray()
  @Type(() => OmitCreateInvoiceProductsDto)
  product: OmitCreateInvoiceProductsDto[];
}

export class UpdateInvoiceWithProducts extends UpdateInvoiceDto {
  @Type(() => OmitCreateInvoiceProductsDto)
  product: OmitCreateInvoiceProductsDto[];
}
