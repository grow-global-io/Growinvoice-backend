import { PlanFeature } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreatePlanFeaturesDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  plan_id: string;
  @ApiProperty({
    enum: PlanFeature,
  })
  @IsNotEmpty()
  feature: PlanFeature;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  @IsNotEmpty()
  @IsInt()
  count: number;
}
