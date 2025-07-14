import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Currencies } from './currencies.entity';
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
    type: 'boolean',
  })
  isOneTime: boolean;
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
  @ApiProperty({
    type: 'string',
  })
  currency_id: string;
  @ApiProperty({
    type: () => Currencies,
    required: false,
  })
  currency?: Currencies;
  @ApiHideProperty()
  PlanFeatures?: PlanFeatures[];
  @ApiHideProperty()
  UserPlans?: UserPlans[];
}
