import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Render,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceDto } from '@shared/models';
import { ApiExtraModels, ApiHideProperty, ApiTags } from '@nestjs/swagger';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { SuccessResponseDto } from '@shared/dto/success-response.dto';
import {
  CreateInvoiceWithProducts,
  UpdateInvoiceWithProducts,
} from './dto/create-invoice-with-products.dto';
import { GetUser, User } from '@shared/decorators/user.decorator';
import { IsPublic } from '@shared/decorators/public.decorator';

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

  @Patch(':id')
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
  @Render('general-11')
  async test(@Param('id') id: string) {
    return this.invoiceService.findInvoiceTest(id).then((invoice) => {
      return { invoice };
    });
  }

  @IsPublic()
  @ApiHideProperty()
  @Get('testa/:id')
  @Render('general-3')
  async testa(@Param('id') id: string) {
    return this.invoiceService.findInvoiceTest(id).then((invoice) => {
      return { invoice };
    });
  }

  @IsPublic()
  @Get('test1/:id')
  async test1(@Param('id') id: string) {
    return this.invoiceService.findInvoiceTest(id);
  }

  @IsPublic()
  @Get('invoicePublicFindOne/:id')
  async invoicePublicFindOne(@Param('id') id: string) {
    return await this.invoiceService.findOne(id);
  }

  @IsPublic()
  @Post('invoicePreviewFromBody')
  @Render('index')
  async invoicePreviewFromBody(
    @Body() createInvoiceDto: CreateInvoiceWithProducts,
  ) {
    return this.invoiceService
      .createInvoicePreview(createInvoiceDto)
      .then((invoice) => {
        return { invoice };
      });
  }
}
