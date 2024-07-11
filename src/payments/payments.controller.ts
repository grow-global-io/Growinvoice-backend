import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
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
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { IsPublic } from '@shared/decorators/public.decorator';

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
  ) {
    return await this.paymentsService.success(session_id, user_id, invoice_id);
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

  @Post('stripePayment')
  @ApiSuccessResponse(String)
  async stripePayment(
    @GetUser() user: User,
    @Query('invoice_id') invoice_id: string,
  ): Promise<SuccessResponseDto<string>> {
    const link = await this.paymentsService.stripePayment(
      user?.sub,
      invoice_id,
    );
    return {
      result: link,
      message: 'Payment created successfully',
    };
  }
}
