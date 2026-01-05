import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  Min,
  ValidateIf,
} from 'class-validator';

export enum InventoryOperation {
  SET = 'set',
  ADD = 'add',
  SUBTRACT = 'subtract',
}

export class CreateInventoryDto {
  @ApiProperty({
    description: 'Product ID to create inventory for',
    example: 'product-id-1',
  })
  @IsString()
  productId: string;

  @ApiProperty({
    description: 'Stock quantity (optional, defaults to 0)',
    example: 50,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @ApiProperty({
    description: 'Low stock threshold (optional, defaults to 10)',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  lowStockThreshold?: number;

  @ApiProperty({
    description: 'Operation type: set, add, or subtract',
    enum: InventoryOperation,
    example: InventoryOperation.SET,
    required: false,
    default: InventoryOperation.SET,
  })
  @IsOptional()
  @IsEnum(InventoryOperation)
  operation?: InventoryOperation;

  @ApiProperty({
    description:
      'Amount to add or subtract (required if operation is add or subtract)',
    example: 10,
    required: false,
  })
  @ValidateIf(
    (o) =>
      o.operation === InventoryOperation.ADD ||
      o.operation === InventoryOperation.SUBTRACT,
  )
  @IsNumber()
  @Min(0.01)
  amount?: number;
}
