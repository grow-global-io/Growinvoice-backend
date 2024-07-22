import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { PlanFeatures } from './planFeatures.entity';
import { UserPlans } from './userPlans.entity';

export class Plans {
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
  name: string;
  @ApiProperty({
    type: 'string',
  })
  description: string;
  @ApiProperty({
    type: 'boolean',
  })
  is_active: boolean;
  @ApiProperty({
    type: 'number',
    format: 'float',
  })
  price: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  days: number;
  @ApiHideProperty()
  PlanFeatures?: PlanFeatures[];
  @ApiHideProperty()
  UserPlans?: UserPlans[];
}
