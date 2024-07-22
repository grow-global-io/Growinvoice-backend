import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PlansService } from './plans.service';
import {
  CreatePlanWithFeaturesDto,
  UpdatePlanWithFeaturesDto,
} from './dto/create-plan-with-features.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { PlansDto } from '@shared/models';
import { SuccessResponseDto } from '@shared/dto/success-response.dto';
import { IsPublic } from '@shared/decorators/public.decorator';

@ApiTags('plans')
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @IsPublic()
  @Post()
  @ApiSuccessResponse(PlansDto)
  @ApiBody({ type: CreatePlanWithFeaturesDto })
  async create(
    @Body() createPlanDto: CreatePlanWithFeaturesDto,
  ): Promise<SuccessResponseDto<PlansDto>> {
    const result = await this.plansService.create(createPlanDto);
    return {
      message: 'Plan created successfully',
      result: result,
    };
  }

  @IsPublic()
  @Get()
  async findAll() {
    return await this.plansService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.plansService.findOne(id);
  }

  @Patch(':id')
  @ApiSuccessResponse(PlansDto)
  async update(
    @Param('id') id: string,
    @Body() updatePlanDto: UpdatePlanWithFeaturesDto,
  ): Promise<SuccessResponseDto<PlansDto>> {
    const plan = await this.plansService.update(id, updatePlanDto);
    return {
      message: 'Plan updated successfully',
      result: plan,
    };
  }

  @Delete(':id')
  @ApiSuccessResponse()
  async remove(@Param('id') id: string): Promise<SuccessResponseDto> {
    await this.plansService.remove(id);
    return {
      message: 'Plan deleted successfully',
    };
  }
}
