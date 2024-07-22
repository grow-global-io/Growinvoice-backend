import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { Plans } from './plans.entity';

export class UserPlans {
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
    type: () => User,
    required: false,
  })
  user?: User;
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
    type: 'string',
    format: 'date-time',
  })
  start_date: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  end_date: Date;
  @ApiProperty({
    type: 'boolean',
  })
  status: boolean;
}
