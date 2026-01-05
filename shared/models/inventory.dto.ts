import { ApiProperty } from '@nestjs/swagger';

export class InventoryDto {
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
  product_id: string;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  quantity: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  lowStockThreshold: number;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  lastUpdated: Date;
  @ApiProperty({
    type: 'string',
  })
  user_id: string;
}
