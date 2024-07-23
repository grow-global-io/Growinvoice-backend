import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { CreateVendorsWithAddressDto } from './dto/create-vendor-with-address.dto';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { VendorsDto } from '@shared/models';
import { SuccessResponseDto } from '@shared/dto/success-response.dto';
import { GetUser, User } from '@shared/decorators/user.decorator';
import { UpdateVendorsWithAddressDto } from './dto/update-vendor-with-address.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('vendors')
@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  @ApiSuccessResponse(VendorsDto)
  async create(
    @Body() createVendorDto: CreateVendorsWithAddressDto,
  ): Promise<SuccessResponseDto<VendorsDto>> {
    const vendor = await this.vendorsService.create(createVendorDto);
    return {
      result: vendor,
      message: 'Vendor created successfully',
    };
  }

  @Get()
  async findAll(@GetUser() user: User) {
    return await this.vendorsService.findAll(user?.sub);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.vendorsService.findOne(id);
  }

  @Patch(':id')
  @ApiSuccessResponse(VendorsDto)
  async update(
    @Param('id') id: string,
    @Body() updateVendorDto: UpdateVendorsWithAddressDto,
  ): Promise<SuccessResponseDto<VendorsDto>> {
    const vendor = await this.vendorsService.update(id, updateVendorDto);
    return {
      result: vendor,
      message: 'Vendor updated successfully',
    };
  }

  @Delete(':id')
  @ApiSuccessResponse()
  async remove(@Param('id') id: string): Promise<SuccessResponseDto> {
    await this.vendorsService.remove(id);
    return {
      message: 'Vendor deleted successfully',
    };
  }
}
