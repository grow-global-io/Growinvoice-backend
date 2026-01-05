import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsEnum, Min, ValidateIf } from 'class-validator';
import { InventoryOperation } from './create-inventory.dto';

export class UpdateInventoryDto {
  @ApiProperty({
    description: 'Stock quantity',
    example: 50,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @ApiProperty({
    description: 'Low stock threshold',
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
