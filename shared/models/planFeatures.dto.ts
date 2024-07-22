import { PlanFeature } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class PlanFeaturesDto {
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
    enum: PlanFeature,
  })
  feature: PlanFeature;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  count: number;
}
