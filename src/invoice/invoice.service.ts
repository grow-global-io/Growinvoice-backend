import { PrismaService } from '@/prisma/prisma.service';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
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
import * as ejs from 'ejs';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class InvoiceService {
  constructor(
    private sharedService: SharedService,
    @Inject(ENHANCED_PRISMA) private prismaService: PrismaService,
    @Inject(forwardRef(() => InvoicesettingsService))
    private invoiceSettings: InvoicesettingsService,
    private readonly mailService: MailService,
    private readonly conf: ConfigService,
    private readonly i18nService: I18nService,
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
              discount: product.discount,
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
            discount: product.discount,
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
          where: {
            isExist: true,
          },
          include: {
            tax_forInvoiceProducts: {
              where: {
                isExist: true,
              },
              include: {
                tax: true,
              },
            },
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
                unit: true,
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
      sub_total: Math.round(Number(invoice.sub_total) * 10) / 10,
      due_amount: Math.round(Number(invoice.due_amount) * 10) / 10,
      paid_amount: Math.round(Number(invoice.paid_amount) * 10) / 10,
      total: Math.round(Number(invoice.total) * 10) / 10,
      product: [
        ...invoice.product.map((item) => {
          // Calculate tax percentage - prioritize invoice-specific taxes, then product taxes
          let taxPercentage = 0;

          // First check invoice-specific taxes (tax_forInvoiceProducts)
          if (
            item?.tax_forInvoiceProducts &&
            item.tax_forInvoiceProducts.length > 0
          ) {
            taxPercentage = item.tax_forInvoiceProducts
              .map((tax) => tax.tax?.percentage || 0)
              .reduce((acc, curr) => acc + curr, 0);
          }
          // Fall back to product-level taxes
          else if (item?.product?.tax && item.product.tax.length > 0) {
            taxPercentage = item.product.tax
              .map((tax) => tax.tax?.percentage || 0)
              .reduce((acc, curr) => acc + curr, 0);
          }

          return {
            ...item,
            price: Math.round(Number(item.price) * 10) / 10,
            total: Math.round(Number(item.total) * 10) / 10,
            product: {
              ...item.product,
              tax: {
                percentage: taxPercentage,
              },
              currency: {
                ...invoice.currency,
              },
            },
          };
        }),
      ],
    };
    // Transform to DTO but preserve our tax.percentage structure
    // plainToInstance will convert tax back to array, so we restore it after
    const dtoInvoice = plainToInstance(InvoiceWithAllDataDto, mapNew);

    // CRITICAL: Always preserve the products array from mapNew to ensure products are never lost
    // This ensures products show up even if plainToInstance filters them out
    if (mapNew.product && mapNew.product.length > 0) {
      dtoInvoice.product = mapNew.product.map((item: any) => {
        const taxPercentage = item?.product?.tax?.percentage;

        // If we have a calculated tax percentage, use it
        if (taxPercentage !== undefined && taxPercentage !== null) {
          return {
            ...item,
            product: {
              ...item.product,
              tax: {
                percentage: taxPercentage,
              },
            },
          };
        }

        // Fallback: try to calculate from tax_forInvoiceProducts or product.tax array
        let calculatedTax = 0;
        if (item?.tax_forInvoiceProducts?.length > 0) {
          calculatedTax = item.tax_forInvoiceProducts.reduce(
            (acc: number, taxItem: any) => {
              return acc + (taxItem?.tax?.percentage || 0);
            },
            0,
          );
        } else if (
          Array.isArray(item?.product?.tax) &&
          item.product.tax.length > 0
        ) {
          calculatedTax = item.product.tax.reduce(
            (acc: number, taxItem: any) => {
              return acc + (taxItem?.tax?.percentage || 0);
            },
            0,
          );
        }

        if (calculatedTax > 0) {
          return {
            ...item,
            product: {
              ...item.product,
              tax: {
                percentage: calculatedTax,
              },
            },
          };
        }

        return item;
      });
    } else if (!dtoInvoice.product) {
      // If products are missing, ensure we have an empty array at minimum
      dtoInvoice.product = [];
    }

    return dtoInvoice;
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
    const t = (key: string, args?: any) => {
      return this.i18nService.t(key, {
        lang: 'en',
        args: args,
      });
    };

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
      ],
    });
    try {
      const page = await browser.newPage();
      page.setDefaultNavigationTimeout(15000); // 15 seconds
      page.setDefaultTimeout(15000);

      // Render invoice HTML directly instead of making HTTP request
      const invoice = await this.findInvoiceTest(id);
      if (!invoice) {
        throw new Error(`Invoice ${id} not found`);
      }

      // Process invoice data similar to test endpoint
      const a = invoice;

      if (a.customer?.billingAddress?.country_name) {
        a.customer.billingAddress.country = {
          name: a.customer.billingAddress.country_name,
          ...a.customer.billingAddress?.country,
        };
        a.customer.billingAddress.state = {
          name: a.customer.billingAddress.state_name,
          ...a.customer.billingAddress?.state,
        };
      }

      const invoiceSettingsWithFormat =
        await this.invoiceSettingsWithFormat(invoice);
      const newInvoice = {
        ...invoiceSettingsWithFormat,
        footer: {
          text: `The personal data presented in this invoice is processed in accordance with the EU GDPR data protection laws for ${invoice?.user?.company[0]?.name || 'Grow Global Strategies Pvt Ltd'} customer invoicing and accounting purposes.`,
        },
        t: t,
      };

      // Render the HTML using EJS
      const html = await ejs.renderFile(
        `./views/invoice/${invoice?.template?.view ?? 'template1'}.ejs`,
        newInvoice,
      );

      // Set content with simpler wait strategy for faster processing
      await page.setContent(html, {
        waitUntil: 'domcontentloaded', // Faster than networkidle0
        timeout: 15000,
      });

      // Wait a short time for any remaining content to render
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        },
        preferCSSPageSize: false,
        displayHeaderFooter: false,
        scale: 0.8,
      });

      await browser.close();
      return pdfBuffer;
    } catch (error) {
      await browser.close();
      console.error('Error generating test PDF:', error);
      throw error;
    }
  }

  async getPdfBufferForInvoice(id: string, lang: string = 'en') {
    const t = (key: string, args?: any) => {
      return this.i18nService.t(key, {
        lang: lang,
        args: args,
      });
    };

    console.log({ t });

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
      ],
    });
    try {
      const page = await browser.newPage();

      // Set shorter timeout for faster processing
      page.setDefaultNavigationTimeout(15000); // 15 seconds
      page.setDefaultTimeout(15000);

      // Render invoice HTML directly instead of making HTTP request
      const invoice = await this.findInvoiceTest(id);
      if (!invoice) {
        throw new Error(`Invoice ${id} not found`);
      }

      // Process invoice data similar to test endpoint
      const a = invoice;
      // Skip logo conversion for faster PDF generation - use URL directly
      // if (a.user?.company?.[0]?.logo) {
      //   a.user.company[0].logo = await convertLogoToBase64(
      //     a.user.company[0].logo,
      //   );
      // }

      if (a.customer?.billingAddress?.country_name) {
        a.customer.billingAddress.country = {
          name: a.customer.billingAddress.country_name,
          ...a.customer.billingAddress?.country,
        };
        a.customer.billingAddress.state = {
          name: a.customer.billingAddress.state_name,
          ...a.customer.billingAddress?.state,
        };
      }

      const invoiceSettingsWithFormat =
        await this.invoiceSettingsWithFormat(invoice);
      const newInvoice = {
        ...invoiceSettingsWithFormat,
        footer: {
          text: `The personal data presented in this invoice is processed in accordance with the EU GDPR data protection laws for ${invoice?.user?.company[0]?.name || 'Grow Global Strategies Pvt Ltd'} customer invoicing and accounting purposes.`,
        },
        t: t,
      };

      // Render the HTML using EJS
      const html = await ejs.renderFile(
        `./views/invoice/${invoice?.template?.view ?? 'template1'}.ejs`,
        newInvoice,
      );

      // Set content with simpler wait strategy for faster processing
      await page.setContent(html, {
        waitUntil: 'domcontentloaded', // Faster than networkidle0
        timeout: 15000,
      });

      // Wait a short time for any remaining content to render
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Generate PDF with lower quality for smaller file size and faster generation
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        },
        // Optimize for speed and smaller file size
        preferCSSPageSize: false,
        displayHeaderFooter: false,
        // Lower quality for faster generation and smaller files
        scale: 0.8, // Reduce scale for smaller file size
      });

      await browser.close();
      return pdfBuffer;
    } catch (error) {
      await browser.close();
      console.error('Error generating invoice PDF:', error);
      throw error;
    }
  }

  async termsAcceptedByUser(id: string) {
    return await this.prismaService.invoice.update({
      where: { id },
      data: {
        termsAccepted: true,
      },
    });
  }

  async bulkInvoiceSentToMail(ids: string[], lang?: string) {
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
    const mailformat = await Promise.all(
      invoices
        ?.filter((invoice) => invoice.customer?.email)
        .map(async (invoice) => {
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

          // Generate PDF attachment for invoice
          let pdfAttachment = null;
          try {
            const pdfBuffer = await this.getPdfBufferForInvoice(
              invoice.id,
              lang,
            );
            if (pdfBuffer && pdfBuffer.length > 0) {
              pdfAttachment = [
                {
                  filename: `Invoice-${invoice.invoice_number}.pdf`,
                  content: pdfBuffer,
                  contentType: 'application/pdf',
                },
              ];
            } else {
              console.error(
                `PDF buffer is empty or null for invoice ${invoice.id}`,
              );
            }
          } catch (error) {
            console.error(
              `Failed to generate invoice PDF for ${invoice.id}:`,
              error,
            );
            // Continue without PDF attachment if generation fails
          }

          return {
            to: to,
            subject: subject,
            html: html,
            userId: invoice.user?.id,
            companyName: invoice.user?.company[0]?.name,
            attachments: pdfAttachment,
          };
        }),
    );
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

  async sendInvoicePaymentReceiptManually(id: string) {
    let paymentId: string | null = null;
    const invoice = await this.findOne(id);
    if (!invoice.customer.email) {
      throw new BadRequestException('Customer email not found');
    }
    const payments = await this.prismaService.payments.findMany({
      where: {
        invoice_id: id,
      },
    });

    if (payments.length === 1) {
      paymentId = payments[0].id;
    }
    if (payments.length > 1 || payments.length === 0) {
      let paymentDetailId: string | null = null;
      const paymentDetail = await this.prismaService.paymentDetails.findFirst({
        where: {
          paymentType: 'Cash',
        },
      });
      if (paymentDetail) {
        paymentDetailId = paymentDetail.id;
      } else {
        const newPayment = await this.prismaService.paymentDetails.create({
          data: {
            user_id: invoice.user_id,
            paymentType: 'Cash',
          },
        });
        paymentDetailId = newPayment.id;
      }

      const payment = await this.prismaService.payments.create({
        data: {
          amount: invoice.total,
          paymentDate: new Date().toISOString(),
          reference_number: invoice.invoice_number,
          paymentDetails_id: paymentDetailId,
          notes: '',
          payment_type: 'Cash',
          user_id: invoice.user_id,
          invoice_id: invoice.id,
        },
      });
      paymentId = payment.id;
    }
    const receipt = await this.prismaService.payments.findUnique({
      where: { id: paymentId! },
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

    const data = {
      receipt: {
        ...receipt,
        price: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: receipt.invoice?.currency?.short_code || 'USD',
        }).format(receipt.amount || 0),
        paymentMade: paymentId,
        invoiceLink: `${process.env.FRONTEND_URL}/invoice/invoicetemplate/${receipt.invoice?.id}`,
        invoiceReceiptDownloadLink: `${process.env.BACKEND_URL}/api/payments/invoice-receipt-download/${paymentId}`,
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
    return invoice;
  }
}
