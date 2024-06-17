import { Quotation, QuotationProducts } from '@shared/models';
import { Type } from 'class-transformer';

export class QuotationWithAllDataDto extends Quotation {
  @Type(() => QuotationProducts)
  quotation?: QuotationProducts[];
}
