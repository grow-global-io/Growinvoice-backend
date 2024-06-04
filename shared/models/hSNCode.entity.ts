import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { Product } from './product.entity';

export class HSNCode {
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
  tax: number;
  @ApiProperty({
    type: 'string',
  })
  user_id: string;
  @ApiProperty({
    required: false,
  })
  user?: User;
  @ApiHideProperty()
  Product?: Product[];
}
