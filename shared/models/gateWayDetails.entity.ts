import { GateWayType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

export class GateWayDetails {
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
    enum: GateWayType,
  })
  type: GateWayType;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  key: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  secret: string | null;
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
    type: 'boolean',
  })
  enabled: boolean;
}
