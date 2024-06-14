import { CreateInvoiceDto, CreateInvoiceProductsDto } from '@shared/models';
import { Type } from 'class-transformer';

export class CreateInvoiceWithProducts extends CreateInvoiceDto {
  @Type(() => CreateInvoiceProductsDto)
  products: CreateInvoiceProductsDto[];
}
