import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceDto, UpdateInvoiceDto } from '@shared/models';
import { ApiTags } from '@nestjs/swagger';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { SuccessResponseDto } from '@shared/dto/success-response.dto';
import { CreateInvoiceWithProducts } from './dto/create-invoice-with-products.dto';

@ApiTags('invoice')
@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  @ApiSuccessResponse(InvoiceDto, { status: 201 })
  async create(
    @Body() createInvoiceDto: CreateInvoiceWithProducts,
  ): Promise<SuccessResponseDto<InvoiceDto>> {
    const invoice = await this.invoiceService.create(createInvoiceDto);
    return {
      message: 'Invoice created successfully',
      result: invoice,
    };
  }

  @Get()
  async findAll() {
    return await this.invoiceService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.invoiceService.findOne(id);
  }

  @Patch(':id')
  @ApiSuccessResponse(InvoiceDto, { status: 200 })
  async update(
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ): Promise<SuccessResponseDto<InvoiceDto>> {
    const invoice = await this.invoiceService.update(id, updateInvoiceDto);
    return {
      message: 'Invoice updated successfully',
      result: invoice,
    };
  }

  @Delete(':id')
  @ApiSuccessResponse()
  async remove(@Param('id') id: string) {
    await this.invoiceService.remove(id);
    return {
      message: 'Invoice deleted successfully',
    };
  }
}
