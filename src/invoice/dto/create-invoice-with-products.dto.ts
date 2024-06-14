import { OmitType } from '@nestjs/swagger';
import { CreateInvoiceDto, CreateInvoiceProductsDto } from '@shared/models';
import { Type } from 'class-transformer';

class OmitCreateInvoiceProductsDto extends OmitType(CreateInvoiceProductsDto, [
  'invoice_id',
] as const) {}

export class CreateInvoiceWithProducts extends CreateInvoiceDto {
  @Type(() => OmitCreateInvoiceProductsDto)
  product: OmitCreateInvoiceProductsDto[];
}
