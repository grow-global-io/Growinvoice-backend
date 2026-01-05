import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateInventoryDto } from './create-inventory.dto';

export class BulkUpdateInventoryDto {
  @ApiProperty({
    description: 'Array of inventory updates',
    type: [CreateInventoryDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInventoryDto)
  updates: CreateInventoryDto[];
}
