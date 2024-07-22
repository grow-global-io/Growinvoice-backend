import { PlanFeature } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdatePlanFeaturesDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  plan_id?: string;
  @ApiProperty({
    enum: PlanFeature,
    required: false,
  })
  @IsOptional()
  feature?: PlanFeature;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
  })
  @IsOptional()
  @IsInt()
  count?: number;
}
