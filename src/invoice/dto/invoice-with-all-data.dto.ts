import { Invoice, ProductDto, InvoiceProducts } from '@shared/models';
import { Type } from 'class-transformer';

export class InvoiceWithAllDataDto extends Invoice {
  @Type(() => ProductDto)
  product?: InvoiceProducts[];
}
