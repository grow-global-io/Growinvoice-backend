import { OmitType } from '@nestjs/swagger';
import {
  CreateInvoiceDto,
  CreateInvoiceProductsDto,
  UpdateInvoiceDto,
} from '@shared/models';
import { Type } from 'class-transformer';

class OmitCreateInvoiceProductsDto extends OmitType(CreateInvoiceProductsDto, [
  'invoice_id',
] as const) {}

export class CreateInvoiceWithProducts extends CreateInvoiceDto {
  @Type(() => OmitCreateInvoiceProductsDto)
  product: OmitCreateInvoiceProductsDto[];
}

export class UpdateInvoiceWithProducts extends UpdateInvoiceDto {
  @Type(() => OmitCreateInvoiceProductsDto)
  product: OmitCreateInvoiceProductsDto[];
}
