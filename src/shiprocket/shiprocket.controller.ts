import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { IsPublic } from '@shared/decorators/public.decorator';
import { ShiprocketService } from './shiprocket.service';

@ApiTags('shiprocket')
@Controller('shiprocket')
export class ShiprocketController {
  constructor(private readonly shiprocketService: ShiprocketService) {}

  @IsPublic()
  @Get('track/awb/:awb')
  @ApiOperation({ summary: 'Track shipment by AWB number' })
  @ApiParam({
    name: 'awb',
    description: 'AWB (Air Waybill) number',
    example: '190-41424751',
  })
  @ApiResponse({
    status: 200,
    description: 'Tracking information retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  async trackByAwb(@Param('awb') awb: string) {
    try {
      return await this.shiprocketService.trackByAwb(awb);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to track shipment',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @IsPublic()
  @Get('track/shipment/:shipmentId')
  @ApiOperation({ summary: 'Track shipment by Shiprocket shipment ID' })
  @ApiParam({
    name: 'shipmentId',
    description: 'Shiprocket shipment ID',
    example: '06AAPCS9575E1ZR',
  })
  @ApiResponse({
    status: 200,
    description: 'Tracking information retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  async trackByShipmentId(@Param('shipmentId') shipmentId: string) {
    try {
      return await this.shiprocketService.trackByShipmentId(shipmentId);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to track shipment',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
}
