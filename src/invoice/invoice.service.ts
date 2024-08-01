import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Invoice, InvoiceDto } from '@shared/models';
import { plainToInstance } from 'class-transformer';
import {
  CreateInvoiceWithProducts,
  UpdateInvoiceWithProducts,
} from './dto/create-invoice-with-products.dto';
import { InvoiceWithAllDataDto } from './dto/invoice-with-all-data.dto';
import {
  formatCompanyAddress,
  formatCustomerBillingAddress,
  formatCustomerShippingAddress,
} from '@shared/utils/formatAddress';
import { InvoicesettingsService } from '@/invoicesettings/invoicesettings.service';

@Injectable()
export class InvoiceService {
  constructor(
    private prismaService: PrismaService,
    private invoiceSettings: InvoicesettingsService,
  ) {}
  async create(createInvoiceDto: CreateInvoiceWithProducts) {
    if (createInvoiceDto?.product?.length === 0) {
      throw new BadRequestException('Products are missing');
    }
    const invoiceDetails = await this.prismaService.invoice.create({
      data: {
        ...createInvoiceDto,
        invoice_number: createInvoiceDto.invoice_number,
        tax_id: createInvoiceDto.tax_id ? createInvoiceDto.tax_id : null,
        product: {
          createMany: {
            data: createInvoiceDto.product.map((product) => {
              return {
                product_id: product.product_id,
                quantity: product.quantity,
                tax_id: product.tax_id,
                hsnCode_id: product.hsnCode_id,
                price: product.price,
                total: product.total,
              };
            }),
          },
        },
      },
    });
    return plainToInstance(InvoiceDto, invoiceDetails);
  }

  async findAll(user_id: string) {
    const invoices = await this.prismaService.invoice.findMany({
      where: { user_id },
      include: {
        customer: true,
      },
    });
    return plainToInstance(Invoice, invoices);
  }

  async findOne(id: string) {
    const invoice = await this.prismaService.invoice.findUnique({
      where: { id },
      include: {
        product: true,
        customer: true,
      },
    });
    return plainToInstance(InvoiceWithAllDataDto, invoice);
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceWithProducts) {
    const invoice = await this.prismaService.invoice.update({
      where: { id },
      data: {
        ...updateInvoiceDto,
        invoice_number: updateInvoiceDto.invoice_number,
        tax_id: updateInvoiceDto.tax_id ? updateInvoiceDto.tax_id : null,
        product: {
          deleteMany: {},
          createMany: {
            data: updateInvoiceDto.product.map((product) => {
              return {
                product_id: product.product_id,
                quantity: product.quantity,
                tax_id: product.tax_id,
                hsnCode_id: product.hsnCode_id,
                price: product.price,
                total: product.total,
              };
            }),
          },
        },
      },
    });
    return plainToInstance(InvoiceDto, invoice);
  }

  async remove(id: string) {
    const invoice = await this.prismaService.invoice.delete({
      where: { id },
    });
    return plainToInstance(InvoiceDto, invoice);
  }

  async findDueInvoices(user_id: string) {
    const invoices = await this.prismaService.invoice.findMany({
      where: { user_id, paid_status: 'Unpaid' },
      include: {
        customer: true,
      },
    });
    return plainToInstance(Invoice, invoices);
  }

  async findPaidInvoices(user_id: string) {
    const invoices = await this.prismaService.invoice.findMany({
      where: { user_id, paid_status: 'Paid' },
      include: {
        customer: true,
      },
    });
    return plainToInstance(Invoice, invoices);
  }

  async findInvoiceTest(id: string) {
    const invoice = await this.prismaService.invoice.findUnique({
      where: { id },
      include: {
        tax: true,
        template: true,
        payment: true,
        product: {
          include: {
            product: {
              include: {
                currency: true,
                tax: true,
                hsnCode: true,
              },
            },
          },
        },
        customer: {
          include: {
            billingAddress: {
              include: {
                country: true,
                state: true,
              },
            },
            shippingAddress: {
              include: {
                country: true,
                state: true,
              },
            },
          },
        },
        user: {
          include: {
            currency: true,
            company: {
              include: {
                country: true,
                state: true,
              },
            },
          },
        },
      },
    });
    return plainToInstance(InvoiceWithAllDataDto, invoice);
  }

  async createInvoicePreview(createInvoiceDto: CreateInvoiceWithProducts) {
    const invoiceDetails: any = {
      ...createInvoiceDto,
    };
    if (createInvoiceDto.tax_id) {
      invoiceDetails.tax = await this.prismaService.tax.findUnique({
        where: { id: createInvoiceDto.tax_id },
      });
    }
    if (createInvoiceDto?.paymentId) {
      invoiceDetails.payment =
        await this.prismaService.paymentDetails.findUnique({
          where: { id: createInvoiceDto.paymentId },
        });
    }
    if (createInvoiceDto?.product?.length > 0) {
      invoiceDetails.product = await Promise.all(
        createInvoiceDto.product.map(async (product) => {
          const productDetails = await this.prismaService.product.findUnique({
            where: { id: product.product_id },
            include: {
              currency: true,
              tax: true,
              hsnCode: true,
            },
          });
          return {
            ...product,
            product: {
              ...productDetails,
            },
          };
        }),
      );
    }
    if (createInvoiceDto?.customer_id) {
      invoiceDetails.customer = await this.prismaService.customer.findUnique({
        where: { id: createInvoiceDto.customer_id },
        include: {
          billingAddress: {
            include: {
              country: true,
              state: true,
            },
          },
          shippingAddress: {
            include: {
              country: true,
              state: true,
            },
          },
        },
      });
    }
    if (createInvoiceDto?.user_id) {
      invoiceDetails.user = await this.prismaService.user.findUnique({
        where: { id: createInvoiceDto.user_id },
        include: {
          currency: true,
          company: {
            include: {
              country: true,
              state: true,
            },
          },
        },
      });
    }
    if (createInvoiceDto?.template_id) {
      invoiceDetails.template =
        await this.prismaService.invoiceTemplate.findUnique({
          where: { id: createInvoiceDto.template_id },
        });
    }
    return invoiceDetails;
  }

  async outstandingReceivable(user_id: string) {
    const invoices = await this.prismaService.invoice.findMany({
      where: { user_id, paid_status: 'Unpaid' },
      select: {
        total: true,
      },
    });
    return invoices.reduce((acc, curr) => acc + curr.total, 0);
  }

  async findDueToday(user_id: string, date: string) {
    const invoices = await this.prismaService.invoice.findMany({
      where: {
        user_id,
        due_date: {
          equals: date,
        },
      },
      select: {
        total: true,
      },
    });
    return invoices.reduce((acc, curr) => acc + curr.total, 0);
  }

  async findDueMonth(user_id: string, date: string) {
    const fromDate = new Date(date);
    const toDate = new Date(fromDate);
    toDate.setDate(toDate.getDate() + 30);

    const fromDateISO = fromDate.toISOString();
    const toDateISO = toDate.toISOString();

    const invoices = await this.prismaService.invoice.findMany({
      where: {
        user_id,
        // date is string
        due_date: {
          gte: fromDateISO,
          lte: toDateISO,
        },
      },
      select: {
        total: true,
      },
    });
    return invoices.reduce((acc, curr) => acc + curr.total, 0);
  }

  async totalDue(user_id: string) {
    const invoices = await this.prismaService.invoice.findMany({
      where: { user_id },
      select: {
        total: true,
      },
    });
    return invoices.reduce((acc, curr) => acc + curr.total, 0);
  }

  async invoiceCount(user_id: string) {
    return await this.prismaService.invoice.count({
      where: { user_id },
    });
  }

  async invoiceSettingsWithFormat(invoice: InvoiceWithAllDataDto) {
    const a = invoice;
    const invoiceSettings = await this.invoiceSettings?.findFirst(
      invoice?.user?.id,
    );
    if (invoiceSettings === null || invoice?.user?.id === null) {
      a.companyAddress = '';
      a.customerBillingAddress = '';
      a.customerShippingAddress = '';
    } else {
      const companyAddress = formatCompanyAddress(
        invoice,
        invoiceSettings?.companyAddressTemplate,
      );
      a.companyAddress = companyAddress === '<p><br></p>' ? '' : companyAddress;
      const customerBillingAddress = formatCustomerBillingAddress(
        invoice,
        invoiceSettings?.customerBillingAddressTemplate,
      );
      a.customerBillingAddress =
        customerBillingAddress === '<p><br></p>' ? '' : customerBillingAddress;
      const customerShippingAddress = formatCustomerShippingAddress(
        invoice,
        invoiceSettings?.customerShippingAddressTemplate,
      );
      a.customerShippingAddress =
        customerShippingAddress === '<p><br></p>'
          ? ''
          : customerShippingAddress;
    }
    return {
      invoice: a,
      invoiceSettings,
    };
  }

  async statusToMailed(id: string) {
    return await this.prismaService.invoice.update({
      where: { id },
      data: {
        status: 'Mailed to customer',
      },
    });
  }

  async statusToPaid(id: string) {
    const invoice = await this.prismaService.invoice.findUnique({
      where: { id },
    });
    return await this.prismaService.invoice.update({
      where: { id },
      data: {
        due_amount: 0,
        paid_amount: invoice.total,
        status: 'Paid',
        paid_status: 'Paid',
      },
    });
  }

  async statusToUnpaid(id: string) {
    const invoice = await this.prismaService.invoice.findUnique({
      where: { id },
    });
    return await this.prismaService.invoice.update({
      where: { id },
      data: {
        due_amount: invoice.total,
        paid_amount: 0,
        status: 'Unpaid',
        paid_status: 'Unpaid',
      },
    });
  }
}
