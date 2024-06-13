import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PaymentdetailsService } from './paymentdetails.service';
import {
  CreatePaymentDetailsDto,
  PaymentDetailsDto,
  UpdatePaymentDetailsDto,
} from '@shared/models';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { SuccessResponseDto } from '@shared/dto/success-response.dto';
import { ApiTags } from '@nestjs/swagger';
import { GetUser, User } from '@shared/decorators/user.decorator';

@ApiTags('paymentdetails')
@Controller('paymentdetails')
export class PaymentdetailsController {
  constructor(private readonly paymentdetailsService: PaymentdetailsService) {}

  @Post()
  @ApiSuccessResponse(PaymentDetailsDto, { status: 201 })
  async create(
    @Body() createPaymentdetailDto: CreatePaymentDetailsDto,
  ): Promise<SuccessResponseDto<PaymentDetailsDto>> {
    const paymentdetail = await this.paymentdetailsService.create(
      createPaymentdetailDto,
    );
    return {
      message: 'Payment detail created successfully',
      result: paymentdetail,
    };
  }

  @Get()
  async findAll(@GetUser() user: User) {
    return await this.paymentdetailsService.findAll(user?.sub);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.paymentdetailsService.findOne(id);
  }

  @Patch(':id')
  @ApiSuccessResponse(PaymentDetailsDto, { status: 201 })
  async update(
    @Param('id') id: string,
    @Body() updatePaymentdetailDto: UpdatePaymentDetailsDto,
  ): Promise<SuccessResponseDto<PaymentDetailsDto>> {
    const paymentdetail = await this.paymentdetailsService.update(
      id,
      updatePaymentdetailDto,
    );
    return {
      message: 'Payment detail updated successfully',
      result: paymentdetail,
    };
  }

  @Delete(':id')
  @ApiSuccessResponse()
  async remove(@Param('id') id: string): Promise<SuccessResponseDto> {
    await this.paymentdetailsService.remove(id);
    return {
      message: 'Payment detail deleted successfully',
    };
  }
}
