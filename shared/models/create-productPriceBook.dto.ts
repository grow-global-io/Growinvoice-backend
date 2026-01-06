import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductPriceBookDto {
  @ApiProperty({
    type: 'number',
    format: 'float',
  })
  @IsNotEmpty()
  @IsNumber()
  price: number;
  @ApiProperty({
    type: 'number',
    format: 'float',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  sellPrice?: number | null;
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
  })
  @IsNotEmpty()
  @IsString()
  currency_id: string;
}
