import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UserWithProducts } from './dto/user-with-products.dto';
import { CheckoutInvoiceCreateDto } from './dto/checkout-invoice.dto';
import { InvoiceDto } from '@shared/models';
import { MailService } from '@/mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';

@Injectable()
export class StoreService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async getStore(userId: string, currency: string): Promise<UserWithProducts> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: {
        product: {
          where: {
            includeStore: true,
            priceBook: {
              some: {
                currency: {
                  short_code: currency,
                },
              },
            },
          },
          include: {
            hsnCode: true,
            priceBook: {
              include: {
                currency: true,
              },
            },
            tax: {
              include: {
                tax: true,
              },
            },
            unit: true,
          },
        },
        company: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return plainToInstance(UserWithProducts, user);
  }

  async searchProducts(
    query: string,
    currency: string,
  ): Promise<UserWithProducts[]> {
    // 1. Define variables for our dynamic query parts
    let userWhereClause: Prisma.UserWhereInput = {};

    const productWhereClause: Prisma.ProductWhereInput = {
      // This filter is always applied, regardless of the query
      includeStore: true,
      priceBook: {
        some: {
          currency: {
            short_code: currency,
          },
        },
      },
    };

    // 2. Conditionally build the query if a search term is provided
    const hasQuery = query && query.trim() !== '';

    if (hasQuery) {
      // Build the main WHERE clause to find users
      userWhereClause = {
        product: {
          some: { name: { contains: query, mode: 'insensitive' } },
        },
      };

      // Add the name filter to the products that are returned
      productWhereClause.name = {
        contains: query,
        mode: 'insensitive',
      };
    }

    // 3. Execute the single, dynamically built query
    const users = await this.prismaService.user.findMany({
      where: userWhereClause, // Use the dynamic where clause
      include: {
        company: true,
        product: {
          where: {
            ...productWhereClause,
            includeStore: true,
          }, // Use the dynamic product filter
          include: {
            hsnCode: true,
            priceBook: {
              include: {
                currency: true,
              },
            },
            tax: {
              include: {
                tax: true,
              },
            },
            unit: true,
          },
        },
      },
    });

    return users
      ?.filter((user) => user.product.length > 0) // Filter out users with no products
      .map((user) => plainToInstance(UserWithProducts, user));
  }

  async createCheckoutInvoice(body: CheckoutInvoiceCreateDto) {
    const currencyDetails = await this.prismaService.currencies.findFirst({
      where: { short_code: body.currency },
    });
    if (!currencyDetails) {
      throw new BadRequestException('Currency not found');
    }

    const existingCustomer = await this.prismaService.customer.findFirst({
      where: {
        email: body.email,
        user_id: body.user_id,
      },
    });
    console.log('Existing Customer:', existingCustomer);

    const customer = await this.prismaService.customer.upsert({
      where: {
        id: existingCustomer ? existingCustomer.id : undefined,
      },
      create: {
        name: body.name,
        option: 'Freelancer',
        gstIn: '',
        billingAddress: {
          create: {
            address: body.shippingDetails.address,
            city: body.shippingDetails.city,
            country_id: body.shippingDetails.country_id,
            state_id: body.shippingDetails.state_id,
            zip: body.shippingDetails.zip,
          },
        },
        shippingAddress: {
          create: {
            address: body.shippingDetails.address,
            city: body.shippingDetails.city,
            country_id: body.shippingDetails.country_id,
            state_id: body.shippingDetails.state_id,
            zip: body.shippingDetails.zip,
          },
        },
        display_name: body.name,
        email: body.email,
        phone: body.phone,
        currencies: {
          connect: {
            id: currencyDetails.id,
          },
        },
        user: {
          connect: {
            id: body.user_id,
          },
        },
      },
      update: {
        name: body.name,
        option: 'Freelancer',
        gstIn: '',
        billingAddress: {
          update: {
            address: body.shippingDetails.address,
            city: body.shippingDetails.city,
            country_id: body.shippingDetails.country_id,
            state_id: body.shippingDetails.state_id,
            zip: body.shippingDetails.zip,
          },
        },
        shippingAddress: {
          update: {
            address: body.shippingDetails.address,
            city: body.shippingDetails.city,
            country_id: body.shippingDetails.country_id,
            state_id: body.shippingDetails.state_id,
            zip: body.shippingDetails.zip,
          },
        },
        display_name: body.name,
        email: body.email,
        phone: body.phone,
        currencies: {
          connect: {
            id: currencyDetails.id,
          },
        },
        user: {
          connect: {
            id: body.user_id,
          },
        },
      },
    });

    if (!customer) {
      throw new BadRequestException('Customer creation failed');
    }
    const template = await this.prismaService.invoiceTemplate.findFirst();
    const payment = await this.prismaService.paymentDetails.findFirst({
      where: {
        user_id: body.user_id,
        OR: [
          {
            paymentType: 'UPI',
          },
          {
            paymentType: {
              not: 'UPI',
            },
          },
        ],
      },
    });

    const invoice = await this.prismaService.invoice.create({
      data: {
        user_id: body.user_id,
        customer_id: customer.id,
        currency_id: currencyDetails.id,
        invoice_number: `INV-${Date.now()}`,
        date: new Date(),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        due_amount: body.products.reduce(
          (total, product) => total + product.total,
          0,
        ),
        is_recurring: false,
        paid_amount: 0,
        sub_total: body.products.reduce(
          (total, product) => total + product.total,
          0,
        ),
        total: body.products.reduce(
          (total, product) => total + product.total,
          0,
        ),
        fromStore: true,
        template_id: template.id,
        paymentId: payment?.id,
      },
    });

    await Promise.all(
      body.products.map(async (product) => {
        return await this.prismaService.invoiceProducts.create({
          data: {
            product_id: product.product_id,
            quantity: product.quantity,
            hsnCode_id: product.hsnId === '' ? undefined : product.hsnId,
            price: product.price,
            total: product.total,
            invoice_id: invoice.id,
            tax_forInvoiceProducts: {
              createMany: {
                data: product.taxes?.map((taxId) => ({ tax_id: taxId })) || [],
              },
            },
          },
        });
      }),
    );

    if (!invoice) {
      throw new BadRequestException('Invoice creation failed');
    }

    await this.mailService.sendMail({
      email: customer.email,
      subject: `Invoice #${invoice.invoice_number} from ${customer.display_name}`,
      body: `
        <p>Dear ${customer.display_name},</p>
        <p>Thank you for your purchase! Please find your invoice details below:</p>
        <p>Invoice Number: ${invoice.invoice_number}</p>
        <p>Total Amount Due: ${invoice.total} ${currencyDetails.short_code}</p>
        <p>Due Date: ${invoice.due_date.toLocaleDateString()}</p>

<div style="margin-top: 20px; padding: 20px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;">
        <p>You can pay your invoice using the following link:</p>
        <a href="${this.configService.get('FRONTEND_URL')}/invoice/invoicetemplate/${invoice.id}" style="color: #007bff; text-decoration: none;">Pay Invoice</a>
        <p>If you have any questions or need assistance, please feel free to contact us.</p>
</div>

        <p>Best regards,</p>
        <p>Growinvoice</p>
      `,
    });

    return plainToInstance(InvoiceDto, invoice);
  }
}
