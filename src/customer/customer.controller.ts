import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { UpdateCustomerDto } from '@shared/models';
import { ApiTags } from '@nestjs/swagger';
import { CreateCustomerWithAddressDto } from './dto/create-customer-with-address.dto';
import { IsPublic } from '@shared/decorators/public.decorator';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { SuccessResponseDto } from '@shared/dto/success-response.dto';
import { GetUser, User } from '@shared/decorators/user.decorator';
import { GetCustomerWithAddressDto } from './dto/get-customer-with-address.dto';

@ApiTags('customer')
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @IsPublic()
  @Post()
  @ApiSuccessResponse(GetCustomerWithAddressDto, { status: 201 })
  async create(
    @Body() createCustomerDto: CreateCustomerWithAddressDto,
  ): Promise<SuccessResponseDto<GetCustomerWithAddressDto>> {
    const customer = await this.customerService.create(createCustomerDto);
    return {
      result: customer,
      message: 'Customer created successfully',
    };
  }

  @Get()
  async findAll(@GetUser() user: User) {
    return await this.customerService.findAll(user?.sub);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.customerService.findOne(id);
  }

  @Patch(':id')
  @ApiSuccessResponse(GetCustomerWithAddressDto, { status: 200 })
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<SuccessResponseDto<GetCustomerWithAddressDto>> {
    return {
      result: await this.customerService.update(id, updateCustomerDto),
      message: 'Customer updated successfully',
    };
  }

  @Delete(':id')
  @ApiSuccessResponse()
  async remove(@Param('id') id: string) {
    await this.customerService.remove(id);
    return {
      message: 'Customer deleted successfully',
    };
  }
}
