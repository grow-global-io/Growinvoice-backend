import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCouponsDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  code: string;
  @ApiProperty({
    type: 'number',
    format: 'float',
  })
  @IsNotEmpty()
  @IsNumber()
  discount: number;
  @ApiProperty({
    type: 'boolean',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  start_date?: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  end_date?: Date;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  user_id: string;
}
