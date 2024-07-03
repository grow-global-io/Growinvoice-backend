import { InvoiceService } from '@/invoice/invoice.service';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  CreatePaymentsDto,
  Payments,
  PaymentsDto,
  UpdatePaymentsDto,
} from '@shared/models';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private invoiceService: InvoiceService,
  ) {}

  async create(createPaymentDto: CreatePaymentsDto) {
    const payments = await this.prisma.payments.create({
      data: createPaymentDto,
    });
    await this.invoiceService.statusToPaid(payments.invoice_id);
    return plainToInstance(PaymentsDto, payments);
  }

  async findAll(user_id: string) {
    const payments = await this.prisma.payments.findMany({
      where: { user_id },
      include: {
        invoice: true,
        paymentDetails: true,
      },
    });
    return payments.map((payment) => plainToInstance(Payments, payment));
  }

  async findOne(id: string) {
    const payment = await this.prisma.payments.findUnique({
      where: { id },
      include: {
        invoice: true,
        paymentDetails: true,
      },
    });
    return plainToInstance(Payments, payment);
  }

  async update(id: string, updatePaymentDto: UpdatePaymentsDto) {
    const payment = await this.prisma.payments.update({
      where: { id },
      data: updatePaymentDto,
    });
    return plainToInstance(PaymentsDto, payment);
  }

  async remove(id: string) {
    const payment = await this.prisma.payments.delete({
      where: { id },
    });
    return plainToInstance(PaymentsDto, payment);
  }
}
