import { DashboardTypes } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class AIDashboardDto {
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
  user_id: string;
  @ApiProperty({
    type: 'string',
  })
  query: string;
  @ApiProperty({
    type: 'string',
  })
  prompt: string;
  @ApiProperty({
    enum: DashboardTypes,
  })
  type: DashboardTypes;
}
