import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

export class Coupons {
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
  code: string;
  @ApiProperty({
    type: 'number',
    format: 'float',
  })
  discount: number;
  @ApiProperty({
    type: 'boolean',
  })
  is_active: boolean;
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
    type: 'string',
  })
  user_id: string;
  @ApiProperty({
    type: () => User,
    required: false,
  })
  user?: User;
}
