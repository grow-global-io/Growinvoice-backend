import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

export class Notification {
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
  title: string;
  @ApiProperty({
    type: 'string',
  })
  body: string;
  @ApiProperty({
    type: 'boolean',
  })
  read: boolean;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  meta: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  metaType: string | null;
}
