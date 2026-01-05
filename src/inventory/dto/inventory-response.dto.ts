import { ApiProperty } from '@nestjs/swagger';

export enum InventoryStatus {
  AVAILABLE = 'available',
  PARTIALLY_AVAILABLE = 'partially_available',
  UNAVAILABLE = 'unavailable',
}

export class InventoryResponseDto {
  @ApiProperty({
    description: 'Inventory entry ID',
    example: 'inventory-id-1',
  })
  id: string;

  @ApiProperty({
    description: 'Product ID',
    example: 'product-id-1',
  })
  productId: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Product Name',
  })
  productName: string;

  @ApiProperty({
    description: 'Current stock quantity',
    example: 50,
  })
  quantity: number;

  @ApiProperty({
    description: 'Low stock threshold',
    example: 10,
  })
  lowStockThreshold: number;

  @ApiProperty({
    description: 'Last updated timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  lastUpdated: string;

  @ApiProperty({
    description: 'Product unit',
    example: 'pcs',
  })
  unit: string;

  @ApiProperty({
    description: 'Inventory status',
    enum: InventoryStatus,
    example: InventoryStatus.AVAILABLE,
  })
  status: InventoryStatus;

  @ApiProperty({
    description: 'User ID',
    example: 'user-id-1',
  })
  user_id: string;

  @ApiProperty({
    description: 'Created at timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Updated at timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  updatedAt: string;
}
