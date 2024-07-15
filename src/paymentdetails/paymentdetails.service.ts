import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { PaymentType } from '@prisma/client';
import {
  CreatePaymentDetailsDto,
  PaymentDetailsDto,
  UpdatePaymentDetailsDto,
} from '@shared/models';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class PaymentdetailsService {
  constructor(private prismaService: PrismaService) {}

  async create(createPaymentdetailDto: CreatePaymentDetailsDto) {
    const paymentdetail = await this.prismaService.paymentDetails.create({
      data: createPaymentdetailDto,
    });
    return plainToInstance(PaymentDetailsDto, paymentdetail);
  }

  async findAll(user_id: string) {
    const paymentdetails = await this.prismaService.paymentDetails.findMany({
      where: { user_id },
    });
    return plainToInstance(PaymentDetailsDto, paymentdetails);
  }

  async findOne(id: string) {
    const paymentDetails = await this.prismaService.paymentDetails.findUnique({
      where: { id },
    });
    return plainToInstance(PaymentDetailsDto, paymentDetails);
  }

  async update(id: string, updatePaymentdetailDto: UpdatePaymentDetailsDto) {
    const paymentdetail = await this.prismaService.paymentDetails.update({
      where: { id },
      data: updatePaymentdetailDto,
    });
    return plainToInstance(PaymentDetailsDto, paymentdetail);
  }

  async remove(id: string) {
    return await this.prismaService.paymentDetails.delete({
      where: { id },
    });
  }

  async findByPaymentTypeandUserId(paymentType: PaymentType, user_id: string) {
    const paymentDetails = await this.prismaService.paymentDetails.findFirst({
      where: { paymentType, user_id },
    });
    return plainToInstance(PaymentDetailsDto, paymentDetails);
  }
}
