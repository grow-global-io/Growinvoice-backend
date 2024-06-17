import { Invoice, InvoiceProducts } from '@shared/models';
import { Type } from 'class-transformer';

export class InvoiceWithAllDataDto extends Invoice {
  @Type(() => InvoiceProducts)
  product?: InvoiceProducts[];
}
