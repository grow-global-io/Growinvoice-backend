import { Type } from 'class-transformer';

export class CustomerCount {
  total: number;
  currentMonth: number;
  lastMonth: number;
}

export class DashboardCount {
  @Type(() => CustomerCount)
  customer: CustomerCount;

  @Type(() => CustomerCount)
  invoiceCount: CustomerCount;

  @Type(() => CustomerCount)
  quotationCount: CustomerCount;

  @Type(() => CustomerCount)
  dueAmount: CustomerCount;
}
