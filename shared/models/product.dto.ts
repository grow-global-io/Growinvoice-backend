import { ProductType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class ProductDto {
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  updatedAt: Date | null;
  @ApiProperty({
    type: 'boolean',
  })
  isExist: boolean;
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  name: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  description: string | null;
  @ApiProperty({
    type: 'number',
    format: 'float',
  })
  price: number;
  @ApiProperty({
    enum: ProductType,
  })
  type: ProductType;
  @ApiProperty({
    type: 'string',
  })
  unit_id: string;
  @ApiProperty({
    type: 'string',
  })
  hsnCode_id: string;
  @ApiProperty({
    type: 'string',
  })
  tax_id: string;
  @ApiProperty({
    type: 'string',
  })
  user_id: string;
}
