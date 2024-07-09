import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DashboardsService } from './dashboards.service';
import {
  AIDashboardDto,
  CreateAIDashboardDto,
  UpdateAIDashboardDto,
} from '@shared/models';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { SuccessResponseDto } from '@shared/dto/success-response.dto';
import { GetUser, User } from '@shared/decorators/user.decorator';

@Controller('dashboards')
export class DashboardsController {
  constructor(private readonly dashboardsService: DashboardsService) {}

  @Post()
  @ApiSuccessResponse(AIDashboardDto)
  async create(
    @Body() createDashboardDto: CreateAIDashboardDto,
  ): Promise<SuccessResponseDto<AIDashboardDto>> {
    const dashboard = await this.dashboardsService.create(createDashboardDto);
    return {
      result: dashboard,
      message: 'Dashboard created successfully',
    };
  }

  @Get()
  async findAll(@GetUser() user: User) {
    return await this.dashboardsService.findAll(user?.sub);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.dashboardsService.findOne(id);
  }

  @Patch(':id')
  @ApiSuccessResponse(AIDashboardDto)
  async update(
    @Param('id') id: string,
    @Body() updateDashboardDto: UpdateAIDashboardDto,
  ): Promise<SuccessResponseDto<AIDashboardDto>> {
    const dashboard = await this.dashboardsService.update(
      id,
      updateDashboardDto,
    );
    return {
      result: dashboard,
      message: 'Dashboard updated successfully',
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const dashboard = await this.dashboardsService.remove(id);
    return {
      result: dashboard,
      message: 'Dashboard deleted successfully',
    };
  }
}
