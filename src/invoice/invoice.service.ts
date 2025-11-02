import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Invoice, InvoiceDto } from '@shared/models';
import { plainToInstance } from 'class-transformer';
import {
  CreateDirectInvoiceWithProducts,
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
import { SharedService } from '@/shared/shared.service';
import { ENHANCED_PRISMA } from '@zenstackhq/server/nestjs';
import * as puppeteer from 'puppeteer';
import * as moment from 'moment-timezone';
import { MailService } from '@/mail/mail.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InvoiceService {
  constructor(
    private sharedService: SharedService,
    @Inject(ENHANCED_PRISMA) private prismaService: PrismaService,
    private invoiceSettings: InvoicesettingsService,
    private readonly mailService: MailService,
    private readonly conf: ConfigService,
  ) {}

  async create(createInvoiceDto: CreateInvoiceWithProducts) {
    const count = await this.prismaService.invoice.count();
    await this.sharedService.checkInvoicesQuota(
      createInvoiceDto.user_id,
      createInvoiceDto?.customer_ids?.length,
    );
    if (createInvoiceDto?.product?.length === 0) {
      throw new BadRequestException('Products are missing');
    }
    const checkInvoiceNumberExists = await this.prismaService.invoice.findFirst(
      {
        where: {
          invoice_number: createInvoiceDto.invoice_number,
          user_id: createInvoiceDto.user_id,
        },
      },
    );
    if (checkInvoiceNumberExists) {
      throw new BadRequestException(
        'Invoice number already exists. Please use a different one.',
      );
    }
    const { product, customer_ids, ...invoiceData } = createInvoiceDto;
    const invoicedata: InvoiceDto[] = [];
    for (const custId of customer_ids || []) {
      const invoiceDetails = await this.prismaService.invoice.create({
        data: {
          ...invoiceData,
          customer_id: custId,
          invoice_number: Array.isArray(createInvoiceDto.customer_ids)
            ? `${Number(moment().format('YYYY')) + count + 1 + customer_ids.indexOf(custId)}`
            : createInvoiceDto.invoice_number,
          reference_number: Array.isArray(createInvoiceDto.customer_ids)
            ? `${Number(moment().format('YYYY')) + count + 1 + customer_ids.indexOf(custId)}`
            : createInvoiceDto.reference_number,
          tax_id: createInvoiceDto.tax_id ? createInvoiceDto.tax_id : null,
        },
      });
      invoicedata.push(invoiceDetails);
      await Promise.all(
        product.map(async (product) => {
          return await this.prismaService.invoiceProducts.create({
            data: {
              product_id: product.product_id,
              quantity: product.quantity,
              hsnCode_id: product.hsnCode_id,
              price: product.price,
              total: product.total,
              invoice_id: invoiceDetails.id,
              tax_forInvoiceProducts: {
                createMany: {
                  data:
                    product.taxes?.map((taxId) => ({ tax_id: taxId })) || [],
                },
              },
            },
          });
        }),
      );
    }
    return plainToInstance(InvoiceDto, invoicedata);
  }

  async findAll(user_id: string, customerId?: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: user_id },
    });
    const invoices = await this.prismaService.invoice.findMany({
      where: {
        user_id: user.isAdmin ? undefined : user_id,
        customer_id: customerId ? customerId : undefined,
      },
      include: {
        customer: true,
        currency: true,
        user: true,
      },
    });
    return plainToInstance(Invoice, invoices);
  }

  async findOne(id: string) {
    const invoice = await this.prismaService.invoice.findUnique({
      where: { id },
      include: {
        payment: true,
        user: {
          include: {
            company: true,
          },
        },
        currency: true,
        product: {
          include: {
            tax_forInvoiceProducts: {
              include: {
                tax: true,
              },
            },
            product: {
              include: {
                tax: {
                  include: {
                    tax: true,
                  },
                },
              },
            },
          },
        },
        customer: true,
      },
    });
    return plainToInstance(InvoiceWithAllDataDto, invoice);
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceWithProducts) {
    const { product, ...invoiceData } = updateInvoiceDto;
    const invoice = await this.prismaService.invoice.update({
      where: { id },
      data: {
        ...invoiceData,
        invoice_number: updateInvoiceDto.invoice_number,
        tax_id: updateInvoiceDto.tax_id ? updateInvoiceDto.tax_id : null,
        // product: {
        //   deleteMany: {},
        //   createMany: {
        //     data: updateInvoiceDto.product.map((product) => {
        //       return {
        //         product_id: product.product_id,
        //         quantity: product.quantity,
        //         hsnCode_id: product.hsnCode_id,
        //         price: product.price,
        //         total: product.total,
        //         tax_forInvoiceProducts: {
        //           deleteMany: {},
        //           createMany: {
        //             data:
        //               product.taxes?.map((taxId) => ({ tax_id: taxId })) || [],
        //           },
        //         },
        //       };
        //     }),
        //   },
        // },
      },
    });
    await this.prismaService.invoiceProducts.deleteMany({
      where: { invoice_id: id },
    });
    await Promise.all(
      product.map(async (product) => {
        return await this.prismaService.invoiceProducts.create({
          data: {
            product_id: product.product_id,
            quantity: product.quantity,
            hsnCode_id: product.hsnCode_id,
            price: product.price,
            total: product.total,
            invoice_id: id,
            tax_forInvoiceProducts: {
              createMany: {
                data: product.taxes?.map((taxId) => ({ tax_id: taxId })) || [],
              },
            },
          },
        });
      }),
    );
    return plainToInstance(InvoiceDto, invoice);
  }

  async remove(id: string) {
    const invoice = await this.prismaService.invoice.delete({
      where: { id },
    });
    return plainToInstance(InvoiceDto, invoice);
  }

  async findDueInvoices(user_id: string, customerId?: string) {
    const invoices = await this.prismaService.invoice.findMany({
      where: {
        user_id,
        paid_status: {
          not: 'Paid',
        },
        customer_id: customerId ? customerId : undefined,
      },
      include: {
        customer: true,
        currency: true,
        product: {
          include: {
            tax_forInvoiceProducts: {
              include: {
                tax: true,
              },
            },
            product: {
              include: {
                tax: true,
                hsnCode: true,
                priceBook: {
                  include: {
                    currency: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return plainToInstance(InvoiceWithAllDataDto, invoices);
  }

  async findPaidInvoices(user_id: string, customerId?: string) {
    const invoices = await this.prismaService.invoice.findMany({
      where: {
        user_id,
        paid_status: 'Paid',
        customer_id: customerId ? customerId : undefined,
      },
      include: {
        customer: true,
        currency: true,
      },
    });
    return plainToInstance(Invoice, invoices);
  }

  async findInvoiceTest(id: string) {
    const invoice = await this.prismaService.invoice.findUnique({
      where: { id },
      include: {
        currency: true,
        tax: true,
        template: true,
        payment: true,

        product: {
          include: {
            product: {
              include: {
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
                hsnCode: {
                  include: {
                    tax: true,
                  },
                },
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

    const mapNew = {
      ...invoice,
      product: [
        ...invoice.product.map((item) => ({
          ...item,
          product: {
            ...item.product,
            tax: {
              percentage:
                item?.product?.tax
                  ?.map((tax) => tax.tax?.percentage)
                  .reduce((acc, curr) => acc + curr, 0) ?? 0,
            },
            currency: {
              ...invoice.currency,
            },
          },
        })),
      ],
    };
    return plainToInstance(InvoiceWithAllDataDto, mapNew);
  }

  async createInvoicePreview(
    createInvoiceDto: CreateDirectInvoiceWithProducts,
  ) {
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
              tax: true,
              hsnCode: true,
              priceBook: {
                include: {
                  currency: true,
                },
              },
            },
          });
          const taxDetails = await this.prismaService.tax.findMany({
            where: {
              id: {
                in: product.taxes || [],
              },
            },
          });
          const currency = await this.prismaService.currencies.findUnique({
            where: { id: invoiceDetails.currency_id },
          });
          return {
            ...product,
            product: {
              ...productDetails,
              tax: taxDetails.reduce(
                (acc, curr) => {
                  return {
                    ...acc,
                    percentage: acc.percentage + (curr.percentage || 0),
                  };
                },
                { percentage: 0 },
              ),
              currency: {
                ...currency,
              },
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
        due_amount: true,
      },
    });
    return invoices.reduce((acc, curr) => acc + curr.due_amount, 0);
  }

  async invoiceCount(user_id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: user_id },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    return await this.prismaService.invoice.count({
      where: { user_id: user?.isAdmin ? undefined : user_id },
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

  async statusToReject(id: string) {
    return await this.prismaService.invoice.update({
      where: { id },
      data: {
        status: 'Rejected',
      },
    });
  }

  async statusToPaid(id: string, amount?: number) {
    const invoice = await this.prismaService.invoice.findUnique({
      where: { id },
    });
    return await this.prismaService.invoice.update({
      where: { id },
      data: {
        due_amount: amount ? invoice.total - amount : 0,
        paid_amount: amount ? invoice.paid_amount + amount : invoice.total,
        status: amount
          ? invoice.total - amount === 0
            ? 'Paid'
            : 'Due'
          : 'Paid',
        paid_status: amount
          ? invoice.total - amount === 0
            ? 'Paid'
            : 'PartiallyPaid'
          : 'Paid',
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

  async testPDFGen(id: string) {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // useful for servers
    });
    const page = await browser.newPage();
    const htmlFetchLink = `${
      process.env.BACKEND_URL || 'http://localhost:5001'
    }/api/invoice/test/${id}`;
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

  async termsAcceptedByUser(id: string) {
    return await this.prismaService.invoice.update({
      where: { id },
      data: {
        termsAccepted: true,
      },
    });
  }

  async bulkInvoiceSentToMail(ids: string[]) {
    const sentInvoices: InvoiceDto[] = [];
    const invoices = await this.prismaService.invoice.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      include: {
        customer: true,
        currency: true,
        user: {
          include: {
            company: true,
          },
        },
      },
    });
    if (invoices.length !== ids.length) {
      throw new BadRequestException('One or more invoice IDs are invalid');
    }
    const mailformat = invoices
      ?.filter((invoice) => invoice.customer?.email)
      .map((invoice) => {
        const companyName =
          invoice.user?.company[0]?.name || 'Grow Global Strategies Pvt Ltd';
        const to = invoice.customer?.email;
        const subject = `Invoice from ${companyName} - Invoice No: ${invoice.invoice_number}`;
        // <p>Please find attached the invoice <strong>${invoice.invoice_number}</strong> for your reference.</p>
        const fromtend =
          this.conf.get<string>('FRONTEND_URL') +
          '/invoice/invoicetemplate/' +
          invoice.id;
        const html = `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Invoice from ${companyName}</title>
  <style>
    /* Basic reset */
    body { margin:0; padding:0; background:#f4f6f8; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial; color:#333; }
    a { color:#1a73e8; text-decoration:none; }
    .container { width:100%; padding:20px 12px; }
    .email-wrapper { max-width:600px; margin:0 auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 6px rgba(16,24,40,0.08); }
    .header { background:linear-gradient(90deg,#0b74de,#0b4fde); color:#fff; padding:20px; display:flex; align-items:center; gap:12px; }
    .logo { width:48px; height:48px; border-radius:6px; background:#fff; display:inline-block; text-align:center; line-height:48px; font-weight:700; color:#0b4fde; }
    .org-name { font-size:18px; font-weight:700; }
    .content { padding:24px; }
    .greeting { font-size:16px; margin-bottom:8px; }
    .intro { color:#555; font-size:14px; line-height:1.45; margin-bottom:18px; }
    .card { border:1px solid #eef2f7; border-radius:8px; padding:16px; margin-bottom:18px; background:#fbfdff; }
    .meta { font-size:14px; color:#444; }
    .btn-wrap { text-align:center; margin:18px 0; }
    .btn { background:#0b74de; color:#fff; padding:12px 20px; border-radius:6px; display:inline-block; font-weight:600; }
    .small { font-size:13px; color:#6b7280; line-height:1.4; }
    .footer { background:#f8fafc; padding:16px 24px; font-size:12px; color:#6b7280; }
    .legal { font-size:11px; color:#94a3b8; margin-top:10px; line-height:1.4; }
    @media (max-width:420px){ .meta {flex-direction:column; align-items:flex-start;} .header {padding:14px} .content {padding:16px} }
  </style>
</head>
<body>
  <div class="container">
    <div class="email-wrapper" role="article" aria-roledescription="email">
      <div class="header">
        <div>
          <div class="org-name">${companyName}</div>
          <div style="font-size:12px;opacity:0.95;">Invoice notification</div>
        </div>
      </div>

      <div class="content">
        <div class="greeting">Hello ${invoice.customer?.name || 'Customer'},</div>

        <div class="intro">
          You have received a new invoice from <strong>${companyName}</strong>.
          Please review the invoice details below and use the button to view or download the invoice.
        </div>

        <div class="card" role="group" aria-label="Invoice details">
          <div style="font-size:15px;font-weight:700;margin-bottom:8px;">Invoice #${invoice.invoice_number}</div>
          <div class="meta">
            <div><strong>Status:</strong> <span style="color:#0b74de">Unpaid</span></div>

            <div><strong>Amount:</strong> <span>${invoice?.total.toLocaleString(
              'en-US',
              {
                style: 'currency',
                currency: invoice.currency?.short_code,
              },
            )}</span></div>
          </div>

          <!-- Optional additional details (date, due date) -->
          <div style="margin-top:12px;color:#475569;font-size:13px">
            <div><strong>Date:</strong> ${moment(invoice?.date).format('MMMM D, YYYY')}</div>
            <div><strong>Due date:</strong> ${moment(invoice?.due_date).format('MMMM D, YYYY')}</div>
          </div>

          <div class="btn-wrap">
            <a class="btn" href="${fromtend}" target="_blank" rel="noopener noreferrer" aria-label="View invoice ${invoice.invoice_number}" style="cursor:pointer; color:#fff !important;">
              View & Download Invoice
            </a>
          </div>

          <div class="small">
            Invoice number: <strong>${invoice.invoice_number}</strong><br/>
            If the link does not work, copy & paste this URL into your browser:<br/>
            <a href="${fromtend}" target="_blank" rel="noopener noreferrer">${fromtend}</a>
          </div>
        </div>

        <div class="small">
          If you have any questions, contact us at
          <a href="mailto:${invoice.user?.email || 'support@growinvoice.com'}">${invoice.user?.email || 'support@growinvoice.com'}</a>.
        </div>

        <div class="legal">
          Best regards,<br/>
          <strong>${companyName}</strong>
        </div>
      </div>

      <div class="footer">

        <div style="margin-top:10px" class="small">
          <i>
            GrowInvoice.com is a GDPR-compliant invoicing service hosted in the EU (AWS Stockholm). Your personal data is used solely for billing and record-keeping purposes. View our <a href="https://growinvoice.com/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
          </i>
          <br/>
          <i>
            GrowInvoice.com on GDPR:n mukainen laskutuspalvelu, joka toimii EU:ssa (AWS Stockholm). Henkilötietojasi käytetään ainoastaan laskutusta ja kirjanpitoa varten. <a href="https://growinvoice.com/privacy-policy" target="_blank" rel="noopener noreferrer">Lue tietosuojaseloste</a>.
          </i>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;
        return {
          to: to,
          subject: subject,
          html: html,
          userId: invoice.user?.id,
          companyName: invoice.user?.company[0]?.name,
        };
      });
    await this.mailService.bulkSendMail({
      body: mailformat,
      companyName: mailformat[0].companyName,
    });
    await this.prismaService.invoice.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: {
        status: 'Mailed to customer',
      },
    });
    invoices.forEach((invoice) => sentInvoices.push(invoice));
    return plainToInstance(InvoiceDto, sentInvoices);
  }
}
