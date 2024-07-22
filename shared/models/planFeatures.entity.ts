import { PlanFeature } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { Plans } from './plans.entity';

export class PlanFeatures {
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
  plan_id: string;
  @ApiProperty({
    type: () => Plans,
    required: false,
  })
  plan?: Plans;
  @ApiProperty({
    enum: PlanFeature,
  })
  feature: PlanFeature;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  count: number;
}
