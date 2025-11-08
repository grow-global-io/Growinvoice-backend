import { GatewaydetailsService } from '@/gatewaydetails/gatewaydetails.service';
import { InvoiceService } from '@/invoice/invoice.service';
import { NotificationsService } from '@/notifications/notifications.service';
import { PrismaService } from '@/prisma/prisma.service';
import { UserService } from '@/user/user.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreatePaymentsDto,
  Payments,
  PaymentsDto,
  UpdatePaymentsDto,
} from '@shared/models';
import { plainToInstance } from 'class-transformer';
import Stripe from 'stripe';
import { RazorpayPaymentDto } from './dto/razorpay-payment-create.dto';
import { PlansService } from '@/plans/plans.service';
import { ConfigService } from '@nestjs/config';
import { UserplansService } from '@/userplans/userplans.service';
import axios from 'axios';
import { MailService } from '@/mail/mail.service';
import * as puppeteer from 'puppeteer';
import * as ejs from 'ejs';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Razorpay = require('razorpay');

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private invoiceService: InvoiceService,
    private userService: UserService,
    private gateWayService: GatewaydetailsService,
    private notificationService: NotificationsService,
    private planService: PlansService,
    private configService: ConfigService,
    private userplansService: UserplansService,
    private readonly mailService: MailService,
  ) {}

  async create(createPaymentDto: CreatePaymentsDto) {
    const payments = await this.prisma.payments.create({
      data: createPaymentDto,
    });
    await this.invoiceService.statusToPaid(
      payments.invoice_id,
      payments.amount,
    );
    const email = await this.prisma.invoice.findUnique({
      where: { id: payments.invoice_id },
      select: {
        customer: {
          select: {
            email: true,
          },
        },
      },
    });
    if (email?.customer?.email) {
      const receipt = await this.invoiceReceiptView(payments.id);
      const data = {
        receipt: {
          ...receipt,
          price: new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: receipt.invoice?.currency?.short_code || 'USD',
          }).format(receipt.amount || 0),
          paymentMade: payments.id,
          invoiceLink: `${process.env.FRONTEND_URL}/invoice/invoicetemplate/${receipt.invoice?.id}`,
          invoiceReceiptDownloadLink: `${process.env.BACKEND_URL}/api/payments/invoice-receipt-download/${payments.id}`,
        },
      };
      const template = await ejs.renderFile(
        './views/receipts/invoice-success-email.ejs',
        data,
      );
      await this.mailService.sendMail({
        email: receipt.invoice?.customer?.email || '',
        subject:
          'Payment Success for Invoice - ' + receipt.invoice?.invoice_number,
        body: template,
      });
    }
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
        invoice: {
          include: {
            currency: true,
            customer: {
              include: {
                billingAddress: {
                  include: {
                    country: true,
                    state: true,
                  },
                },
              },
            },
          },
        },
        paymentDetails: true,
        user: {
          include: {
            company: true,
          },
        },
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
    const stripe = new Stripe(stripeKey?.key);
    const stripePaymentLink = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: invoice.currency.short_code || 'USD', // Fallback to USD if currency is not set
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

  async growlimitlessPayment(user_id: string, invoice_id: string) {
    try {
      const invoice = await this.invoiceService.findOne(invoice_id);
      if (!invoice) {
        throw new Error('Invoice not found');
      }
      if (invoice.user_id !== user_id) {
        throw new Error('Unauthorized');
      }
      const growlimitlessPayment = await this.gateWayService.getbyuserIdandType(
        user_id,
        'Growlimitless',
      );
      if (!growlimitlessPayment) {
        throw new Error('Growlimitless key not found');
      }
      if (growlimitlessPayment?.enabled === false) {
        throw new Error('Growlimitless key not enabled');
      }
      const gll_Url = this.configService.get<string>('GROWLIMITLESS_URL');
      const data = await axios.post(
        `${gll_Url}/api/sessions`,
        {
          mode: 'payment',
          line_items: [
            {
              price_data: {
                currency: invoice.currency.short_code || 'USD', // Fallback to USD if currency is not set
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
          success_url: `${process.env.BACKEND_URL}/api/payments/growlimitless/success?session_id={CHECKOUT_SESSION_ID}&user_id=${user_id}&invoice_id=${invoice_id}`,
          cancel_url: `${process.env.BACKEND_URL}/api/payments/cancel?type=cancel`,
          metadata: {
            invoice_id,
            user_id,
          },
          apiKey: growlimitlessPayment.key,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      if (data.status !== 201) {
        throw new Error('Error creating payment link');
      }
      return data.data?.uri;
    } catch (error) {
      const message =
        error?.response?.data ??
        error?.message ??
        'Error creating payment link';
      throw new NotFoundException(message);
    }
  }

  async stripePaymentLinkForPlan(user_id: string, plan_id: string) {
    const plan = await this.planService.findOne(plan_id);
    if (!plan) {
      throw new BadRequestException('Plan not found');
    }
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new BadRequestException('Stripe key not found');
    }
    const stripe = new Stripe(stripeKey);
    const stripePaymentLink = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: plan.currency.short_code || 'USD',
            product_data: {
              name: `Payment for the plan - ${plan?.name}`,
              description: 'Payment for the plan - ' + plan?.name,
            },
            unit_amount: Math.round(plan?.price * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.BACKEND_URL}/api/payments/successPlans?session_id={CHECKOUT_SESSION_ID}&user_id=${user_id}&plan_id=${plan_id}`,
      cancel_url: `${process.env.BACKEND_URL}/api/payments/cancelPlans?type=cancel`,
      billing_address_collection: 'required',
      metadata: {
        plan_id,
        user_id,
      },
    });
    return stripePaymentLink?.url;
  }

  async growlimitlessPyamentsForPlans(user_id: string, plan_id: string) {
    const plan = await this.planService.findOne(plan_id);
    if (!plan) {
      throw new BadRequestException('Plan not found');
    }
    const user = await this.prisma.user.findFirst({
      where: { id: user_id },
      include: {
        UserPlans: {
          include: {
            plan: true,
          },
        },
      },
    });

    if (plan.isOneTime && user?.UserPlans?.find((p) => p.plan.isOneTime)) {
      throw new BadRequestException('Already purchased a one-time plan');
    }

    const growlimitlessKey = this.configService.get<string>(
      'GROWLIMITLESS_API_KEY',
    );
    const gll_Url = this.configService.get<string>('GROWLIMITLESS_URL');
    try {
      const data = await axios.post(
        `${gll_Url}/api/sessions`,
        {
          mode: 'payment',
          line_items: [
            {
              price_data: {
                currency: plan.currency.short_code || 'USD',
                product_data: {
                  name: `Payment for the plan - ${plan?.name}`,
                  description: 'Payment for the plan - ' + plan?.name,
                },
                unit_amount: Math.round(plan?.price * 100),
              },
              quantity: 1,
            },
          ],
          success_url: `${process.env.BACKEND_URL}/api/payments/successGrowlimitlessPlans?session_id={CHECKOUT_SESSION_ID}&user_id=${user_id}&plan_id=${plan_id}`,
          cancel_url: `${process.env.BACKEND_URL}/api/payments/cancelPlans?type=cancel`,
          metadata: {
            plan_id,
            user_id,
          },
          apiKey: growlimitlessKey,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      if (data.status !== 201) {
        throw new Error('Error creating payment link');
      }
      return data.data?.uri;
    } catch (error) {
      const message =
        error?.response?.data ??
        error?.message ??
        'Error creating payment link';
      throw new NotFoundException(message);
    }
  }

  async successPlans(session_id: string, user_id: string, plan_id: string) {
    const plan = await this.planService.findOne(plan_id);
    if (!plan) {
      throw new Error('Plan not found');
    }
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe key not found');
    }
    const stripe = new Stripe(stripeKey);
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status === 'paid') {
      const end_date = new Date();
      end_date.setDate(end_date.getDate() + plan.days);
      await this.userplansService.create({
        end_date: end_date,
        plan_id,
        start_date: new Date(),
        session_id,
        status: true,
        user_id,
        payment_type: 'Stripe',
      });
      await this.notificationService.create({
        user_id,
        title: 'Payment Success',
        body: 'Payment for plan ' + plan.name + ' is successful',
      });
      // redirect to success page
      return true;
    }
    return false;
  }

  async successGrowlimitlessPlans(
    user_id: string,
    plan_id: string,
    session_id?: string,
  ) {
    const plan = await this.planService.findOne(plan_id);
    if (!plan) {
      throw new Error('Plan not found');
    }
    const user = await this.prisma.user.findFirst({
      where: { id: user_id },
      include: {
        company: {
          include: {
            country: true,
            state: true,
          },
        },
        currency: true,
      },
    });
    const templateData = {
      user,
      plan: {
        ...plan,
        price: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: plan?.currency?.short_code || 'USD',
        }).format(plan?.price || 0),
      },
      // paymentMade: payment,
      // transaction: {
      //   id: '-',
      // },
    };
    if (plan.price === 0 && !session_id) {
      const end_date = new Date();
      end_date.setDate(end_date.getDate() + plan.days);
      const payment = await this.userplansService.create({
        end_date: end_date,
        plan_id,
        start_date: new Date(),
        session_id: 'Test',
        status: true,
        user_id,
        payment_type: 'Growlimitless',
      });
      await this.notificationService.create({
        user_id,
        title: 'Payment Success',
        body: 'Payment for plan ' + plan.name + ' is successful',
      });
      const template = await ejs.renderFile(
        './views/receipts/plan-success-email.ejs',
        {
          ...templateData,
          paymentMade: payment,
          transaction: {
            id: '-',
          },
        },
      );
      await this.mailService.sendMail({
        email: user.email,
        subject: 'Payment Success',
        body: template,
      });
      // redirect to success page
      return true;
    }
    const checkSession = await this.prisma.userPlans.findFirst({
      where: {
        session_id,
      },
    });
    if (checkSession) {
      throw new Error('Session already exists');
    }
    const checkSessioninvoice = await this.prisma.payments.findFirst({
      where: {
        otherId: session_id,
      },
    });
    if (checkSessioninvoice) {
      throw new Error('Session already exists');
    }

    const gll_Url = this.configService.get<string>('GROWLIMITLESS_URL');
    const data = await axios.get(
      `${gll_Url}/api/sessions?sessionId=${session_id}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    if (data.status !== 200) {
      throw new Error('Error creating payment link');
    }
    if (data.data.paymentStatus === 'SUCCESS') {
      const end_date = new Date();
      end_date.setDate(end_date.getDate() + plan.days);
      const payment = await this.userplansService.create({
        end_date: end_date,
        plan_id,
        start_date: new Date(),
        session_id,
        status: true,
        user_id,
        payment_type: 'Growlimitless',
      });
      await this.notificationService.create({
        user_id,
        title: 'Payment Success',
        body: 'Payment for plan ' + plan.name + ' is successful',
      });
      const template = await ejs.renderFile(
        './views/receipts/plan-success-email.ejs',
        {
          ...templateData,
          paymentMade: payment,
          transaction: {
            id: session_id,
          },
        },
      );
      await this.mailService.sendMail({
        email: user.email,
        subject: 'Payment Success',
        body: template,
      });
      // redirect to success page
      return true;
    }
    return false;
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
        otherId: session_id,
      });
      await this.invoiceService.statusToPaid(invoice_id, invoice.total);
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

  async growlimitlessSuccess(
    session_id: string,
    user_id: string,
    invoice_id: string,
  ) {
    const invoice = await this.invoiceService.findOne(invoice_id);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    if (invoice.user_id !== user_id) {
      throw new Error('Unauthorized');
    }
    const growlimitlessPayment = await this.gateWayService.getbyuserIdandType(
      user_id,
      'Growlimitless',
    );
    if (!growlimitlessPayment) {
      throw new Error('Growlimitless key not found');
    }
    if (growlimitlessPayment?.enabled === false) {
      throw new Error('Growlimitless key not enabled');
    }
    const gll_Url = this.configService.get<string>('GROWLIMITLESS_URL');
    const data = await axios.get(
      `${gll_Url}/api/sessions?sessionId=${session_id}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    if (data.status !== 200) {
      throw new Error('Error creating payment link');
    }
    if (data.data.paymentStatus === 'SUCCESS') {
      await this.create({
        invoice_id,
        user_id,
        amount: invoice.total,
        paymentDetails_id: invoice?.paymentId,
        paymentDate: new Date(),
        payment_type: 'GrowLimitLess',
        otherId: session_id,
      });
      await this.invoiceService.statusToPaid(invoice_id, invoice.total);
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

  async successRazorpay(
    razorpay_payment_id: string,
    user_id: string,
    invoice_id: string,
  ) {
    const invoice = await this.invoiceService.findOne(invoice_id);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    if (invoice.user_id !== user_id) {
      throw new Error('Unauthorized');
    }
    const razorpayKey = await this.gateWayService.getbyuserIdandType(
      user_id,
      'Razorpay',
    );
    if (!razorpayKey) {
      throw new Error('Razorpay key not found');
    }
    if (razorpayKey?.enabled === false) {
      throw new Error('Razorpay key not enabled');
    }
    const razorpay = new Razorpay({
      key_id: razorpayKey?.key,
      key_secret: razorpayKey?.secret,
    });

    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    if (payment.status === 'captured') {
      await this.create({
        invoice_id,
        user_id,
        amount: invoice.total,
        paymentDetails_id: invoice?.paymentId,
        paymentDate: new Date(),
        payment_type: 'Razorpay',
        otherId: razorpay_payment_id,
      });
      await this.invoiceService.statusToPaid(invoice_id, invoice.total);
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

  async successRazorpayForPlans(
    razorpay_payment_id: string,
    user_id: string,
    plan_id: string,
  ) {
    const plan = await this.planService.findOne(plan_id);
    if (!plan) {
      throw new Error('Plan not found');
    }
    const razorpayKey = this.configService.get<string>('RAZORPAY_KEY');
    const razorpaySecret = this.configService.get<string>('RAZORPAY_SECRET');
    if (!razorpayKey || !razorpaySecret) {
      throw new Error('Razorpay key not found');
    }
    const razorpay = new Razorpay({
      key_id: razorpayKey,
      key_secret: razorpaySecret,
    });
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    if (payment.status === 'captured') {
      const end_date = new Date();
      end_date.setDate(end_date.getDate() + plan.days);
      await this.userplansService.create({
        end_date: end_date,
        plan_id,
        start_date: new Date(),
        session_id: razorpay_payment_id,
        status: true,
        user_id,
        payment_type: 'Razorpay',
      });
      await this.notificationService.create({
        user_id,
        title: 'Payment Success',
        body: 'Payment for plan ' + plan.name + ' is successful',
      });
      // redirect to success page
      return true;
    }
    return false;
  }

  async razorpayPaymentForPlans(user_id: string, plan_id: string) {
    const plan = await this.planService.findOne(plan_id);
    if (!plan) {
      throw new Error('Plan not found');
    }
    const razorpayKey = this.configService.get<string>('RAZORPAY_KEY');
    const razorpaySecret = this.configService.get<string>('RAZORPAY_SECRET');
    if (!razorpayKey || !razorpaySecret) {
      throw new Error('Razorpay key not found');
    }
    const razorpay = new Razorpay({
      key_id: razorpayKey,
      key_secret: razorpaySecret,
    });
    const rand4digit = Math.floor(1000 + Math.random() * 9000);

    const order = await razorpay.orders.create({
      amount: Math.round(plan?.price * 100),
      currency: plan.currency.short_code || 'INR',
      receipt: `plan-${rand4digit}`,
      payment_capture: true,
    });

    if (!order || !order.id) {
      throw new Error('Error creating Razorpay order');
    }

    return plainToInstance(RazorpayPaymentDto, {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    });
  }

  async razorpayPayment(user_id: string, invoice_id: string) {
    const invoice = await this.invoiceService.findOne(invoice_id);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    if (invoice.user_id !== user_id) {
      throw new Error('Unauthorized');
    }
    const razorpayKey = await this.gateWayService.getbyuserIdandType(
      user_id,
      'Razorpay',
    );
    if (!razorpayKey) {
      throw new Error('Razorpay key not found');
    }
    if (razorpayKey?.enabled === false) {
      throw new Error('Razorpay key not enabled');
    }
    const userDetails = await this.userService.findOne(user_id);
    const razorpay = new Razorpay({
      key_id: razorpayKey?.key,
      key_secret: razorpayKey?.secret,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(invoice?.total * 100),
      currency: userDetails?.currency?.short_code,
      receipt: invoice?.invoice_number,
      payment_capture: true,
    });

    return plainToInstance(RazorpayPaymentDto, {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    });
  }
  async planReceiptView(user_plan_id: string) {
    const userPlan = await this.prisma.userPlans.findUnique({
      where: { id: user_plan_id },
      include: {
        plan: {
          include: {
            currency: true,
          },
        },
        user: {
          include: {
            company: {
              include: {
                country: true,
                state: true,
              },
            },
            currency: true,
          },
        },
      },
    });
    if (!userPlan) {
      throw new NotFoundException('User plan not found');
    }
    return userPlan;
  }

  async getPdfBufferForPlanReceipt(user_plan_id: string) {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // useful for servers
    });
    const page = await browser.newPage();
    const htmlFetchLink = `${
      process.env.BACKEND_URL || 'http://localhost:5000'
    }/api/payments/plan-receipt-view/${user_plan_id}`;
    await page.goto(htmlFetchLink, {
      waitUntil: 'networkidle0',
    });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      },
    });

    await browser.close();

    return pdfBuffer;
  }

  async invoiceReceiptView(id: string) {
    const invoice = await this.findOne(id);
    return invoice;
  }

  async getPdfBufferForInvoiceReceipt(id: string) {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // useful for servers
    });
    const page = await browser.newPage();
    const htmlFetchLink = `${
      process.env.BACKEND_URL || 'http://localhost:5000'
    }/api/payments/invoice-receipt-view/${id}`;
    await page.goto(htmlFetchLink, {
      waitUntil: 'networkidle0',
    });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      },
    });

    await browser.close();

    return pdfBuffer;
  }
}
