import { ApiProperty } from '@nestjs/swagger';
import { PlanFeature } from '@prisma/client';

export class UserQuotaDto {
  @ApiProperty({
    enum: PlanFeature,
  })
  feature: PlanFeature;

  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  quotaCount: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  usedCount: number;
}
