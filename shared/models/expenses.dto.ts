import { ExpenseCategory } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class ExpensesDto {
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
    nullable: true,
  })
  receipt_url: string | null;
  @ApiProperty({
    enum: ExpenseCategory,
  })
  category: ExpenseCategory;
  @ApiProperty({
    type: 'string',
  })
  vendor_id: string;
  @ApiProperty({
    type: 'string',
  })
  user_id: string;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  expenseDate: Date;
  @ApiProperty({
    type: 'number',
    format: 'float',
  })
  amount: number;
  @ApiProperty({
    type: 'string',
  })
  currency_id: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  notes: string | null;
}
