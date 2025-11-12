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
  ParseArrayPipe,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceDto } from '@shared/models';
import {
  ApiExtraModels,
  ApiHideProperty,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { SuccessResponseDto } from '@shared/dto/success-response.dto';
import {
  CreateDirectInvoiceWithProducts,
  CreateInvoiceWithProducts,
  UpdateInvoiceWithProducts,
} from './dto/create-invoice-with-products.dto';
import { GetUser, User } from '@shared/decorators/user.decorator';
import { IsPublic } from '@shared/decorators/public.decorator';
import { Response } from 'express';
import { convertLogoToBase64 } from '@shared/utils/constants';
import { MailService } from '@/mail/mail.service';
import { SendMailDto } from '@/mail/dto/send-mail.dto';

@ApiExtraModels(InvoiceDto)
@ApiTags('invoice')
@Controller('invoice')
export class InvoiceController {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly mailService: MailService,
  ) {}

  @Post()
  @ApiSuccessResponse(InvoiceDto, { status: 201 })
  async create(
    @Body() createInvoiceDto: CreateInvoiceWithProducts,
  ): Promise<SuccessResponseDto<InvoiceDto>> {
    const invoice = await this.invoiceService.create(createInvoiceDto);
    return {
      message: 'Invoice created successfully',
      result: invoice[0],
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
  @ApiQuery({
    name: 'customerId',
    required: false,
    description: 'Filter by customer ID',
    type: String,
  })
  async findAll(
    @GetUser() user: User,
    @Query('customerId') customerId?: string,
  ) {
    return await this.invoiceService.findAll(user.sub, customerId);
  }

  @Get('due')
  @ApiQuery({
    name: 'customerId',
    required: false,
    description: 'Filter by customer ID',
    type: String,
  })
  async findDueInvoices(
    @GetUser() user: User,
    @Query('customerId') customerId?: string,
  ) {
    return await this.invoiceService.findDueInvoices(user.sub, customerId);
  }

  @Get('paid')
  @ApiQuery({
    name: 'customerId',
    required: false,
    description: 'Filter by customer ID',
    type: String,
  })
  async findPaidInvoices(
    @GetUser() user: User,
    @Query('customerId') customerId?: string,
  ) {
    return await this.invoiceService.findPaidInvoices(user.sub, customerId);
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
    if (a.customer?.billingAddress?.country_name) {
      a.customer.billingAddress.country = {
        name: a.customer.billingAddress.country_name,
        ...a.customer.billingAddress?.country,
      };
      a.customer.billingAddress.state = {
        name: a.customer.billingAddress.state_name,
        ...a.customer.billingAddress?.state,
      };
    }
    const invoiceSettingsWithFormat =
      await this.invoiceService.invoiceSettingsWithFormat(invoice);
    // (invoice as any)?.footer?.text =
    //   `By viewing this invoice, you acknowledge that the data displayed is processed by ${invoice?.user?.company[0]?.name || 'Grow Global Strategies Pvt Ltd'} on behalf of ${invoice.customer?.name || 'Customer'} for the purpose of billing and record-keeping in accordance with applicable data protection laws (GDPR).`;
    const newInvoice = {
      ...invoiceSettingsWithFormat,
      footer: {
        text: `The personal data presented in this invoice is processed in accordance with the EU GDPR data protection laws for ${invoice?.user?.company[0]?.name || 'Grow Global Strategies Pvt Ltd'}'s customer invoicing and accounting purposes.`,
      },
    };
    return res.render(
      'invoice/' + (invoice?.template?.view ?? 'template1'),
      newInvoice,
    );
  }

  @IsPublic()
  @ApiHideProperty()
  @Get('test-pdf-gen/:id')
  @ApiResponse({ status: 200, type: String })
  async testPDFGen(@Param('id') id: string, @Res() res?: Response) {
    const pdfBuffer = await this.invoiceService.testPDFGen(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=invoice.pdf',
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }

  @IsPublic()
  @Get('invoicePublicFindOne/:id')
  async invoicePublicFindOne(@Param('id') id: string) {
    return await this.invoiceService.findOne(id);
  }

  @Post('invoiceSentToMail')
  @ApiSuccessResponse(InvoiceDto, { status: 200 })
  async invoiceSentToMail(
    @Body() createInvoiceDto: SendMailDto,
    @Query('id') id: string,
  ): Promise<SuccessResponseDto<InvoiceDto>> {
    const invoice = await this.invoiceService.statusToMailed(id);
    await this.mailService.sendMail(createInvoiceDto, invoice?.user_id);
    return {
      message: 'Invoice created and sent to mail successfully',
      result: invoice,
    };
  }

  @Post('bulkInvoiceSentToMail')
  @ApiSuccessResponse(InvoiceDto, { status: 200 })
  @ApiQuery({
    name: 'ids',
    required: true,
    description: 'Array of Invoice IDs',
    isArray: true,
    type: String,
  })
  async bulkInvoiceSentToMail(
    @Query(
      'ids',
      new ParseArrayPipe({ items: String, separator: ',', optional: false }),
    )
    ids: string[],
  ) {
    const res = await this.invoiceService.bulkInvoiceSentToMail(ids);
    return {
      message: 'Invoices sent to customers successfully',
      result: res,
    };
  }

  @Post('markedAsRejected')
  @ApiSuccessResponse(InvoiceDto, { status: 200 })
  async markedAsRejected(
    @Query('id') id: string,
  ): Promise<SuccessResponseDto<InvoiceDto>> {
    const invoice = await this.invoiceService.statusToReject(id);
    return {
      message: 'Invoice Rejected successfully',
      result: invoice,
    };
  }

  @IsPublic()
  @Post('termsAcceptedByUser')
  @ApiSuccessResponse(InvoiceDto, { status: 200 })
  async termsAcceptedByUser(
    @Query('id') id: string,
  ): Promise<SuccessResponseDto<InvoiceDto>> {
    const invoice = await this.invoiceService.termsAcceptedByUser(id);
    return {
      message: 'Invoice terms accepted successfully',
      result: invoice,
    };
  }

  @Post('markedAsPaid')
  @ApiSuccessResponse(InvoiceDto, { status: 200 })
  async markedAsPaid(
    @Query('id') id: string,
  ): Promise<SuccessResponseDto<InvoiceDto>> {
    const invoice = await this.invoiceService.statusToPaid(id);
    return {
      message: 'Invoice marked as paid successfully',
      result: invoice,
    };
  }

  @Post('send-invoice-payment-receipt-manually')
  @ApiSuccessResponse(InvoiceDto, { status: 200 })
  async sendInvoicePaymentReceiptManually(
    @Query('id') id: string,
  ): Promise<SuccessResponseDto<InvoiceDto>> {
    const invoice =
      await this.invoiceService.sendInvoicePaymentReceiptManually(id);
    return {
      message: 'Invoice payment receipt sent successfully',
      result: invoice,
    };
  }

  @Post('markedAsUnpaid')
  @ApiSuccessResponse(InvoiceDto, { status: 200 })
  async markedAsUnpaid(
    @Query('id') id: string,
  ): Promise<SuccessResponseDto<InvoiceDto>> {
    const invoice = await this.invoiceService.statusToUnpaid(id);
    return {
      message: 'Invoice marked as unpaid successfully',
      result: invoice,
    };
  }

  @Post('markedAsMailed')
  @ApiSuccessResponse(InvoiceDto, { status: 200 })
  async markedAsMailed(
    @Query('id') id: string,
  ): Promise<SuccessResponseDto<InvoiceDto>> {
    const invoice = await this.invoiceService.statusToMailed(id);
    return {
      message: 'Invoice marked as mailed successfully',
      result: invoice,
    };
  }

  @IsPublic()
  @Post('invoicePreviewFromBody')
  @ApiResponse({ status: 200, type: String })
  async invoicePreviewFromBody(
    @Body() createInvoiceDto: CreateDirectInvoiceWithProducts,
    @Res() res?: Response,
  ) {
    const invoice =
      await this.invoiceService.createInvoicePreview(createInvoiceDto);
    const invoiceSettings =
      await this.invoiceService?.invoiceSettingsWithFormat(invoice);
    const newInvoice = {
      ...invoiceSettings,
      footer: {
        text: `The personal data presented in this invoice is processed in accordance with the EU GDPR data protection laws for ${invoice?.user?.company[0]?.name || 'Grow Global Strategies Pvt Ltd'}'s customer invoicing and accounting purposes.`,
      },
    };
    return res.render(
      'invoice/' + (invoice?.template?.view ?? 'template1'),
      newInvoice,
    );
  }
}
