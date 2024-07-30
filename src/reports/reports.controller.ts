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
}
