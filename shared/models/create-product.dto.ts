import { ProductType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    type: 'string',
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
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
    type: 'boolean',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  includeStore?: boolean;
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
