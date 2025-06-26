import { ProductWithAllDataDto } from '@/product/dto/product-with-allproperties.dto';
import { Company, User } from '@shared/models';
import { Type } from 'class-transformer';

export class UserWithProducts extends User {
  @Type(() => ProductWithAllDataDto)
  product: ProductWithAllDataDto[];

  @Type(() => Company)
  company: Company[];
}
