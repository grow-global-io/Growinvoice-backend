import { OmitType } from '@nestjs/swagger';
import {
  CreateQuotationDto,
  CreateQuotationProductsDto,
  UpdateQuotationDto,
} from '@shared/models';
import { Type } from 'class-transformer';

class OmitCreateQuotationProductsDto extends OmitType(
  CreateQuotationProductsDto,
  ['quotation_id'] as const,
) {}

export class CreateQuotationWithProducts extends CreateQuotationDto {
  @Type(() => OmitCreateQuotationProductsDto)
  quotation: OmitCreateQuotationProductsDto[];
}

export class UpdateQuotationWithProducts extends UpdateQuotationDto {
  @Type(() => OmitCreateQuotationProductsDto)
  quotation: OmitCreateQuotationProductsDto[];
}
