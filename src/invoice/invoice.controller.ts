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
import axios from 'axios';
import { InvoicesettingsService } from '@/invoicesettings/invoicesettings.service';
import { formatCompanyAddress } from '@shared/utils/formatAddress';

@ApiExtraModels(InvoiceDto)
@ApiTags('invoice')
@Controller('invoice')
export class InvoiceController {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly invoiceSettings: InvoicesettingsService,
  ) {}

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
    if (invoice?.user?.company[0]?.logo) {
      try {
        const imageUrl = invoice.user.company[0].logo;
        const image = await axios.get(imageUrl, {
          responseType: 'arraybuffer',
        });
        const base64Image = Buffer.from(image.data, 'binary').toString(
          'base64',
        );
        invoice.user.company[0].logo = `data:image/webp;base64,${base64Image}`;
        a.user.company[0].logo = `data:image/webp;base64,${base64Image}`;
      } catch (error) {
        console.error('Error fetching or converting image:', error);
      }
    }
    const invoiceSettings = await this.invoiceSettings?.findFirst(
      invoice?.user?.id,
    );
    if (invoiceSettings === null) {
      a.companyAddress = '';
    } else {
      const companyAddress = formatCompanyAddress(
        invoice,
        invoiceSettings?.companyAddressTemplate,
      );
      a.companyAddress = companyAddress;
    }
    return res.render(invoice?.template?.view ?? 'template1', {
      invoice: a,
      invoiceSettings,
    });
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

    return res.render(invoice?.template?.view ?? 'template1', { invoice });
  }
}
