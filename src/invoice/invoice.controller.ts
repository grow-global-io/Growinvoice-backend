import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Res,
  Put,
  Query,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceDto } from '@shared/models';
import {
  ApiExtraModels,
  ApiHideProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { SuccessResponseDto } from '@shared/dto/success-response.dto';
import {
  CreateInvoiceWithProducts,
  UpdateInvoiceWithProducts,
} from './dto/create-invoice-with-products.dto';
import { GetUser, User } from '@shared/decorators/user.decorator';
import { IsPublic } from '@shared/decorators/public.decorator';
import { Response } from 'express';
import { convertLogoToBase64 } from '@shared/utils/constants';

@ApiExtraModels(InvoiceDto)
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

  @Get('outstandingReceivable')
  async outstandingReceivable(@GetUser() user: User) {
    return await this.invoiceService.outstandingReceivable(user.sub);
  }

  @Get('dueToday')
  async findDueToday(@GetUser() user: User, @Query('date') date: string) {
    return await this.invoiceService.findDueToday(user.sub, date);
  }

  @Get('dueMonth')
  async findDueMonth(@GetUser() user: User, @Query('date') date: string) {
    return await this.invoiceService.findDueMonth(user.sub, date);
  }

  @Get('totalDue')
  async totalDue(@GetUser() user: User) {
    return await this.invoiceService.totalDue(user.sub);
  }

  @Get('invoiceCount')
  async invoiceCount(@GetUser() user: User) {
    return await this.invoiceService.invoiceCount(user.sub);
  }

  @Get()
  async findAll(@GetUser() user: User) {
    return await this.invoiceService.findAll(user.sub);
  }

  @Get('due')
  async findDueInvoices(@GetUser() user: User) {
    return await this.invoiceService.findDueInvoices(user.sub);
  }

  @Get('paid')
  async findPaidInvoices(@GetUser() user: User) {
    return await this.invoiceService.findPaidInvoices(user.sub);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.invoiceService.findOne(id);
  }

  @Put(':id')
  @ApiSuccessResponse(InvoiceDto, { status: 200 })
  async update(
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceWithProducts,
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

  @IsPublic()
  @ApiHideProperty()
  @Get('test/:id')
  @ApiResponse({ status: 200, type: String })
  async test(@Param('id') id: string, @Res() res?: Response) {
    const invoice = await this.invoiceService.findInvoiceTest(id);
    const a = invoice;
    if (!invoice) {
      return res.status(404).json({
        message: 'Invoice not found',
      });
    }
    a.user.company[0].logo = await convertLogoToBase64(a.user.company[0].logo);
    const invoiceSettingsWithFormat =
      await this.invoiceService.invoiceSettingsWithFormat(invoice);
    return res.render(
      'invoice/' + invoice?.template?.view ?? 'template1',
      invoiceSettingsWithFormat,
    );
  }

  @IsPublic()
  @Get('invoicePublicFindOne/:id')
  async invoicePublicFindOne(@Param('id') id: string) {
    return await this.invoiceService.findOne(id);
  }

  @IsPublic()
  @Post('invoicePreviewFromBody')
  @ApiResponse({ status: 200, type: String })
  async invoicePreviewFromBody(
    @Body() createInvoiceDto: CreateInvoiceWithProducts,
    @Res() res?: Response,
  ) {
    const invoice =
      await this.invoiceService.createInvoicePreview(createInvoiceDto);
    const invoiceSettings =
      await this.invoiceService?.invoiceSettingsWithFormat(invoice);
    return res.render(
      'invoice/' + invoice?.template?.view ?? 'template1',
      invoiceSettings,
    );
  }
}
