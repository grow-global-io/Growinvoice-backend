import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateInvoiceProductsDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  invoice_id: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  product_id: string;
  @ApiProperty({
    type: 'number',
    format: 'float',
  })
  @IsNotEmpty()
  @IsNumber()
  quantity: number;
  @ApiProperty({
    type: 'number',
    format: 'float',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  tax?: number | null;
  @ApiProperty({
    type: 'number',
    format: 'float',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  hsnCode?: number | null;
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
  })
  @IsNotEmpty()
  @IsNumber()
  total: number;
}
