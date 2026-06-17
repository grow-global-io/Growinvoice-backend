import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiQuery, ApiOperation, ApiExtraModels } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { InventoryResponseDto } from './dto/inventory-response.dto';
import { BulkUpdateInventoryDto } from './dto/bulk-update-inventory.dto';
import { GetUser, User } from '@shared/decorators/user.decorator';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';

@ApiExtraModels(InventoryResponseDto)
@ApiTags('inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get all inventory entries' })
  @ApiQuery({
    name: 'excludeUnits',
    required: false,
    description:
      'Comma-separated list of units to exclude (e.g., "monthly,quadrimester")',
    type: String,
  })
  @ApiSuccessResponse(InventoryResponseDto)
  async findAll(
    @GetUser() user: User,
    @Query('excludeUnits') excludeUnits?: string,
  ) {
    const excludeUnitsArray = excludeUnits
      ? excludeUnits.split(',').map((u) => u.trim())
      : undefined;

    const inventory = await this.inventoryService.findAll(
      user.sub,
      excludeUnitsArray,
    );

    return {
      message: 'Inventory entries retrieved successfully',
      data: inventory,
    };
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get inventory entry by product ID' })
  @ApiSuccessResponse(InventoryResponseDto)
  async findByProductId(
    @Param('productId') productId: string,
    @GetUser() user: User,
  ) {
    const inventory = await this.inventoryService.findByProductId(
      productId,
      user.sub,
    );

    return {
      message: 'Inventory entry retrieved successfully',
      data: inventory,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create or update inventory entry' })
  @ApiSuccessResponse(InventoryResponseDto, { status: 201 })
  async create(
    @Body() createInventoryDto: CreateInventoryDto,
    @GetUser() user: User,
  ) {
    const inventory = await this.inventoryService.create(
      createInventoryDto,
      user.sub,
    );

    return {
      message: 'Inventory entry created/updated successfully',
      data: inventory,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update inventory entry' })
  @ApiSuccessResponse(InventoryResponseDto)
  async update(
    @Param('id') id: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
    @GetUser() user: User,
  ) {
    const inventory = await this.inventoryService.update(
      id,
      updateInventoryDto,
      user.sub,
    );

    return {
      message: 'Inventory entry updated successfully',
      data: inventory,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete inventory entry' })
  @ApiSuccessResponse()
  async remove(@Param('id') id: string, @GetUser() user: User) {
    await this.inventoryService.remove(id, user.sub);

    return {
      message: 'Inventory entry deleted successfully',
    };
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk update inventory entries' })
  @ApiSuccessResponse(InventoryResponseDto)
  async bulkUpdate(
    @Body() bulkUpdateDto: BulkUpdateInventoryDto,
    @GetUser() user: User,
  ) {
    const inventory = await this.inventoryService.bulkUpdate(
      bulkUpdateDto.updates,
      user.sub,
    );

    return {
      message: 'Inventory entries updated successfully',
      data: inventory,
    };
  }
}
