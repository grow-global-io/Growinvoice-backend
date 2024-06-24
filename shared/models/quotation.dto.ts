import { ApiProperty } from '@nestjs/swagger';

export class QuotationDto {
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
  customer_id: string;
  @ApiProperty({
    type: 'string',
  })
  user_id: string;
  @ApiProperty({
    type: 'string',
  })
  quatation_number: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  reference_number: string | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  date: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  expiry_at: Date;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  notes: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  private_notes: string | null;
  @ApiProperty({
    type: 'number',
    format: 'float',
  })
  sub_total: number;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  tax_id: string | null;
  @ApiProperty({
    type: 'number',
    format: 'float',
    nullable: true,
  })
  discountPercentage: number | null;
  @ApiProperty({
    type: 'number',
    format: 'float',
  })
  total: number;
}
