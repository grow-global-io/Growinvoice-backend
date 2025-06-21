import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductPriceBookProductIdCurrencyIdUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  product_id: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  currency_id: string;
}

@ApiExtraModels(ProductPriceBookProductIdCurrencyIdUniqueInputDto)
export class ConnectProductPriceBookDto {
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: ProductPriceBookProductIdCurrencyIdUniqueInputDto,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductPriceBookProductIdCurrencyIdUniqueInputDto)
  product_id_currency_id?: ProductPriceBookProductIdCurrencyIdUniqueInputDto;
}
