import { ExpensesDto, InvoiceDto } from '@shared/models';
import { Type } from 'class-transformer';

export class ProfitLossCountDto {
  totalIncome: number;
  totalExpenses: number;
  profitOrLoss: number;
}

export class ProfitLostReportsDto {
  @Type(() => InvoiceDto)
  invoices: InvoiceDto[];

  @Type(() => ExpensesDto)
  expenses: ExpensesDto[];
}
