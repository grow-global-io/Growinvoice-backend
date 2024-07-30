import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { GetUser, User } from '@shared/decorators/user.decorator';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('profit-loss-count')
  @ApiQuery({ name: 'start', required: true })
  @ApiQuery({ name: 'end', required: true })
  async getProfitLossCount(
    @GetUser() user: User,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.reportsService.getResultsForProfitAndLoss({
      userId: user.sub,
      start,
      end,
    });
  }

  @Get('profit-loss-reports')
  @ApiQuery({ name: 'start', required: true })
  @ApiQuery({ name: 'end', required: true })
  async getProfitLossReports(
    @GetUser() user: User,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.reportsService.getProfitLossReports({
      userId: user.sub,
      start,
      end,
    });
  }

  @Get('profit-loss-range')
  async getProfitLossRange(@GetUser() user: User) {
    return this.reportsService.getProfitLossDateRange(user.sub);
  }

  @Get('customer-reports')
  @ApiQuery({ name: 'start', required: true })
  @ApiQuery({ name: 'end', required: true })
  async getCustomerReports(
    @GetUser() user: User,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.reportsService.getCustomerReports({
      userId: user.sub,
      start,
      end,
    });
  }

  @Get('product-reports')
  @ApiQuery({ name: 'start', required: true })
  @ApiQuery({ name: 'end', required: true })
  async getProductReports(
    @GetUser() user: User,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.reportsService.getProductReports({
      userId: user.sub,
      start,
      end,
    });
  }

  @Get('expense-reports')
  @ApiQuery({ name: 'start', required: true })
  @ApiQuery({ name: 'end', required: true })
  async getExpenseReports(
    @GetUser() user: User,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.reportsService.getExpenseReports({
      userId: user.sub,
      start,
      end,
    });
  }

  @Get('invoice-reports')
  @ApiQuery({ name: 'start', required: true })
  @ApiQuery({ name: 'end', required: true })
  async getInvoiceReports(
    @GetUser() user: User,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.reportsService.getInvoiceReports({
      userId: user.sub,
      start,
      end,
    });
  }
}
