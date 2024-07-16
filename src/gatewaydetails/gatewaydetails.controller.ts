import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { GatewaydetailsService } from './gatewaydetails.service';
import {
  CreateGateWayDetailsDto,
  GateWayDetailsDto,
  UpdateGateWayDetailsDto,
} from '@shared/models';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { SuccessResponseDto } from '@shared/dto/success-response.dto';
import { GetUser, User } from '@shared/decorators/user.decorator';
import { ApiTags } from '@nestjs/swagger';
import { IsPublic } from '@shared/decorators/public.decorator';

@ApiTags('gatewaydetails')
@Controller('gatewaydetails')
export class GatewaydetailsController {
  constructor(private readonly gatewaydetailsService: GatewaydetailsService) {}

  @Post()
  @ApiSuccessResponse(GateWayDetailsDto)
  async create(
    @Body() createGatewaydetailDto: CreateGateWayDetailsDto,
  ): Promise<SuccessResponseDto<GateWayDetailsDto>> {
    const gatewaydetails = await this.gatewaydetailsService.create(
      createGatewaydetailDto,
    );
    return {
      result: gatewaydetails,
      message: 'Gateway details created successfully',
    };
  }

  @Get()
  async findAll(@GetUser() user: User) {
    return await this.gatewaydetailsService.findAll(user?.sub);
  }

  @IsPublic()
  @Get('enabled')
  async findEnabledAll(@Query('user_id') user_id: string) {
    return await this.gatewaydetailsService.findEnabledAll(user_id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.gatewaydetailsService.findOne(id);
  }

  @Patch(':id')
  @ApiSuccessResponse(GateWayDetailsDto)
  async update(
    @Param('id') id: string,
    @Body() updateGatewaydetailDto: UpdateGateWayDetailsDto,
  ): Promise<SuccessResponseDto<GateWayDetailsDto>> {
    const gateWayDetails = await this.gatewaydetailsService.update(
      id,
      updateGatewaydetailDto,
    );
    return {
      result: gateWayDetails,
      message: 'Gateway details updated successfully',
    };
  }

  @Delete(':id')
  @ApiSuccessResponse()
  async remove(@Param('id') id: string): Promise<SuccessResponseDto> {
    await this.gatewaydetailsService.remove(id);
    return {
      message: 'Gateway details removed successfully',
    };
  }
}
