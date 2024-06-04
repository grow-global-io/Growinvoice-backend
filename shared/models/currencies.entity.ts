import { ApiProperty } from '@nestjs/swagger';

export class Currencies {
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
  symbol: string;
  @ApiProperty({
    type: 'string',
  })
  code: string;
  @ApiProperty({
    type: 'string',
  })
  short_code: string;
}
