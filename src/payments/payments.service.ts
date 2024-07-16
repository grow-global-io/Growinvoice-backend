import { GatewaydetailsService } from '@/gatewaydetails/gatewaydetails.service';
import { InvoiceService } from '@/invoice/invoice.service';
import { NotificationsService } from '@/notifications/notifications.service';
import { PaymentdetailsService } from '@/paymentdetails/paymentdetails.service';
import { PrismaService } from '@/prisma/prisma.service';
import { UserService } from '@/user/user.service';
import { Injectable } from '@nestjs/common';
import {
  CreatePaymentsDto,
  Payments,
  PaymentsDto,
  UpdatePaymentsDto,
} from '@shared/models';
import { plainToInstance } from 'class-transformer';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private invoiceService: InvoiceService,
    private paymentsDetails: PaymentdetailsService,
    private userService: UserService,
    private gateWayService: GatewaydetailsService,
    private notificationService: NotificationsService,
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

  async stripePayment(user_id: string, invoice_id: string) {
    const invoice = await this.invoiceService.findOne(invoice_id);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    if (invoice.user_id !== user_id) {
      throw new Error('Unauthorized');
    }
    const stripeKey = await this.gateWayService.getbyuserIdandType(
      user_id,
      'Stripe',
    );
    if (!stripeKey) {
      throw new Error('Stripe key not found');
    }
    if (stripeKey?.enabled === false) {
      throw new Error('Stripe key not enabled');
    }
    const userDetails = await this.userService.findOne(user_id);
    const stripe = new Stripe(stripeKey?.key);
    const stripePaymentLink = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: userDetails?.currency?.short_code,
            product_data: {
              name: 'Invoice Payment',
              description:
                'Payment for the invoice - ' + invoice?.invoice_number,
            },
            unit_amount: Math.round(invoice?.total * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.BACKEND_URL}/api/payments/success?session_id={CHECKOUT_SESSION_ID}&user_id=${user_id}&invoice_id=${invoice_id}`,
      cancel_url: `${process.env.BACKEND_URL}/api/payments/cancel?type=cancel`,
      billing_address_collection: 'required',
      metadata: {
        invoice_id,
        user_id,
      },
    });
    return stripePaymentLink?.url;
  }

  async success(session_id: string, user_id: string, invoice_id: string) {
    const invoice = await this.invoiceService.findOne(invoice_id);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    if (invoice.user_id !== user_id) {
      throw new Error('Unauthorized');
    }
    const stripeKey = await this.gateWayService.getbyuserIdandType(
      user_id,
      'Stripe',
    );
    const stripe = new Stripe(stripeKey?.key);
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status === 'paid') {
      await this.create({
        invoice_id,
        user_id,
        amount: invoice.total,
        paymentDetails_id: invoice?.paymentId,
        paymentDate: new Date(),
        payment_type: 'Stripe',
      });
      await this.invoiceService.statusToPaid(invoice_id);
      await this.notificationService.create({
        user_id,
        title: 'Payment Success',
        body:
          'Payment for invoice ' + invoice.invoice_number + ' is successful',
      });
      // redirect to success page
      return true;
    }
    return false;
  }
}
