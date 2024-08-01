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
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IsPublic } from '@shared/decorators/public.decorator';
import { Response } from 'express';

@ApiExtraModels(PaymentsDto)
@ApiExtraModels(Payments)
@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

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
}
