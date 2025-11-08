import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import {
  CreatePaymentsDto,
  Payments,
  PaymentsDto,
  UpdatePaymentsDto,
} from '@shared/models';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { SuccessResponseDto } from '@shared/dto/success-response.dto';
import { GetUser, User } from '@shared/decorators/user.decorator';
import {
  ApiExtraModels,
  ApiHideProperty,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IsPublic } from '@shared/decorators/public.decorator';
import { Response } from 'express';
import moment = require('moment-timezone');

@ApiExtraModels(PaymentsDto)
@ApiExtraModels(Payments)
@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @IsPublic()
  @Get('successGrowlimitlessPlans')
  async successGrowlimitlessPlans(
    @Query('plan_id') plan_id: string,
    @Query('user_id') user_id: string,
    @Res() res: Response,
    @Query('session_id') session_id?: string,
  ) {
    const success = await this.paymentsService.successGrowlimitlessPlans(
      user_id,
      plan_id,
      session_id,
    );
    if (success) {
      return res.redirect(`${process.env.FRONTEND_URL}/payment/success`);
    }
    return res.redirect(`${process.env.FRONTEND_URL}/payment/failure`);
  }

  @IsPublic()
  @Get('success')
  async success(
    @Query('session_id') session_id: string,
    @Query('invoice_id') invoice_id: string,
    @Query('user_id') user_id: string,
    @Res() res: Response,
  ) {
    const success = await this.paymentsService.success(
      session_id,
      user_id,
      invoice_id,
    );
    if (success) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/invoice/invoicetemplate/${invoice_id}`,
      );
    }
    return res.redirect(`${process.env.FRONTEND_URL}/payment/failure`);
  }

  @IsPublic()
  @Post('growlimitlessPaymentForPlans')
  @ApiResponse({
    status: 200,
    type: String,
  })
  async growlimitlessPyamentsForPlans(
    @Query('user_id') user_id: string,
    @Query('plan_id') plan_id: string,
  ) {
    const link = await this.paymentsService.growlimitlessPyamentsForPlans(
      user_id,
      plan_id,
    );
    return link;
  }

  @IsPublic()
  @Get('growlimitless/success')
  async growlimitlessSuccess(
    @Query('session_id') session_id: string,
    @Query('invoice_id') invoice_id: string,
    @Query('user_id') user_id: string,
    @Res() res: Response,
  ) {
    const success = await this.paymentsService.growlimitlessSuccess(
      session_id,
      user_id,
      invoice_id,
    );
    if (success) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/invoice/invoicetemplate/${invoice_id}`,
      );
    }
    return res.redirect(`${process.env.FRONTEND_URL}/payment/failure`);
  }

  @IsPublic()
  @Get('successPlans')
  async successPlans(
    @Query('session_id') session_id: string,
    @Query('plan_id') plan_id: string,
    @Query('user_id') user_id: string,
    @Res() res: Response,
  ) {
    const success = await this.paymentsService.successPlans(
      session_id,
      user_id,
      plan_id,
    );
    if (success) {
      return res.redirect(`${process.env.FRONTEND_URL}/payment/success`);
    }
    return res.redirect(`${process.env.FRONTEND_URL}/payment/failure`);
  }

  @IsPublic()
  @Get('cancelPlans')
  async cancelPlans(@Res() res: Response) {
    return res.redirect(`${process.env.FRONTEND_URL}/payment/failure`);
  }

  @IsPublic()
  @Get('successRazorpay')
  @ApiQuery({ name: 'razorpay_payment_id', required: true })
  @ApiQuery({ name: 'invoice_id', required: true })
  @ApiQuery({ name: 'user_id', required: true })
  @ApiResponse({
    status: 200,
    type: Boolean,
  })
  async successRazorpay(
    @Query('razorpay_payment_id') razorpay_payment_id: string,
    @Query('invoice_id') invoice_id: string,
    @Query('user_id') user_id: string,
  ) {
    const success = await this.paymentsService.successRazorpay(
      razorpay_payment_id,
      user_id,
      invoice_id,
    );

    return success;
  }

  @Post()
  @ApiSuccessResponse(PaymentsDto)
  async create(
    @Body() createPaymentDto: CreatePaymentsDto,
  ): Promise<SuccessResponseDto<PaymentsDto>> {
    const payments = await this.paymentsService.create(createPaymentDto);
    return {
      result: payments,
      message: 'Payment created successfully',
    };
  }

  @Get()
  async findAll(@GetUser() user: User) {
    return await this.paymentsService.findAll(user?.sub);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.paymentsService.findOne(id);
  }

  @Patch(':id')
  @ApiSuccessResponse(PaymentsDto)
  async update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentsDto,
  ): Promise<SuccessResponseDto<PaymentsDto>> {
    const payments = await this.paymentsService.update(id, updatePaymentDto);
    return {
      result: payments,
      message: 'Payment updated successfully',
    };
  }

  @Delete(':id')
  @ApiSuccessResponse()
  async remove(@Param('id') id: string): Promise<SuccessResponseDto> {
    await this.paymentsService.remove(id);
    return {
      message: 'Payment deleted successfully',
    };
  }

  @IsPublic()
  @Post('stripePayment')
  async stripePayment(
    @Query('user_id') user_id: string,
    @Query('invoice_id') invoice_id: string,
  ) {
    const link = await this.paymentsService.stripePayment(user_id, invoice_id);
    return link;
  }

  @IsPublic()
  @Post('growlimitlessPayment')
  async growlimitlessPayment(
    @Query('user_id') user_id: string,
    @Query('invoice_id') invoice_id: string,
  ) {
    const link = await this.paymentsService.growlimitlessPayment(
      user_id,
      invoice_id,
    );
    return link;
  }

  @IsPublic()
  @Post('stripePaymentForPlans')
  async stripePaymentForPlans(
    @Query('user_id') user_id: string,
    @Query('plan_id') plan_id: string,
  ) {
    const link = await this.paymentsService.stripePaymentLinkForPlan(
      user_id,
      plan_id,
    );
    return link;
  }

  @IsPublic()
  @Post('razorpayPaymentForPlans')
  async razorpayPaymentForPlans(
    @Query('user_id') user_id: string,
    @Query('plan_id') plan_id: string,
  ) {
    const link = await this.paymentsService.razorpayPaymentForPlans(
      user_id,
      plan_id,
    );
    return link;
  }

  @IsPublic()
  @Post('successrazorpayPayment')
  async successrazorpayPayment(
    @Query('razorpay_payment_id') razorpay_payment_id: string,
    @Query('plan_id') plan_id: string,
    @Query('user_id') user_id: string,
    @Res() res: Response,
  ) {
    const success = await this.paymentsService.successRazorpayForPlans(
      razorpay_payment_id,
      user_id,
      plan_id,
    );

    if (success) {
      return res.redirect(`${process.env.FRONTEND_URL}/payment/success`);
    }
    return res.redirect(`${process.env.FRONTEND_URL}/payment/failure`);
  }

  @IsPublic()
  @Post('razorpayPayment')
  async razorpayPayment(
    @Query('user_id') user_id: string,
    @Query('invoice_id') invoice_id: string,
  ) {
    const link = await this.paymentsService.razorpayPayment(
      user_id,
      invoice_id,
    );
    return link;
  }

  @IsPublic()
  @ApiHideProperty()
  @Get('plan-receipt-view/:user_plan_id')
  @ApiResponse({ status: 200, type: String })
  async planReceiptView(
    @Param('user_plan_id') user_plan_id: string,
    @Res() res?: Response,
  ) {
    const receipt = await this.paymentsService.planReceiptView(user_plan_id);
    const priceFromatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: receipt.plan?.currency?.short_code || 'USD',
    });
    const data = {
      receipt: {
        ...receipt,
        price: priceFromatter.format(receipt.plan?.price || 0),
        start_date: moment(receipt.start_date).format('MM/DD/YY'),
        end_date: moment(receipt.end_date).format('MM/DD/YY'),
      },
    };
    // console.dir(data, { depth: null });
    return res.render('receipts/plan-receipt', data);
  }

  @IsPublic()
  @ApiHideProperty()
  @Get('plan-receipt-download/:user_plan_id')
  @ApiResponse({ status: 200, type: String })
  async planReceiptDownload(
    @Param('user_plan_id') user_plan_id: string,
    @Res() res: Response,
  ) {
    const pdfBuffer =
      await this.paymentsService.getPdfBufferForPlanReceipt(user_plan_id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=plan-receipt.pdf',
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }

  @IsPublic()
  @ApiHideProperty()
  @Get('invoice-receipt-view/:id')
  @ApiResponse({ status: 200, type: String })
  async invoiceReceiptView(@Param('id') id: string, @Res() res?: Response) {
    const receipt = await this.paymentsService.invoiceReceiptView(id);
    const data = {
      receipt: {
        ...receipt,
        price: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: receipt.invoice?.currency?.short_code || 'USD',
        }).format(receipt.amount || 0),
        paymentMade: id,
        // http://localhost:5173/invoice/invoicetemplate/cmhnwji0k000awyop7y4jhaq1
        invoiceLink: `${process.env.FRONTEND_URL}/invoice/invoicetemplate/${receipt.invoice?.id}`,
        invoiceReceiptDownloadLink: `${process.env.BACKEND_URL}/api/payments/invoice-receipt-download/${id}`,
      },
    };
    return res.render('receipts/invoice-receipt', {
      receipt: data.receipt,
    });
  }

  @IsPublic()
  @ApiHideProperty()
  @Get('invoice-receipt-download/:id')
  @ApiResponse({ status: 200, type: String })
  async invoiceReceiptDownload(@Param('id') id: string, @Res() res: Response) {
    const pdfBuffer =
      await this.paymentsService.getPdfBufferForInvoiceReceipt(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=invoice-receipt.pdf',
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }
}
