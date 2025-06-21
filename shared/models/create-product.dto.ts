import { ProductType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  description?: string | null;
  @ApiProperty({
    enum: ProductType,
  })
  @IsNotEmpty()
  type: ProductType;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  unit_id: string;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  hsnCode_id?: string | null;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  user_id: string;
}
