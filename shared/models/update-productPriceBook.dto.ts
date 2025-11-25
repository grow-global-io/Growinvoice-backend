import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateProductPriceBookDto {
  @ApiProperty({
    type: 'number',
    format: 'float',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  price?: number;
  @ApiProperty({
    type: 'number',
    format: 'float',
    default: 0,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  shippingCharges?: number | null;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  currency_id?: string;
}
