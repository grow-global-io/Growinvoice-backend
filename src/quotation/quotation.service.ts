import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CreateQuotationWithProducts,
  UpdateQuotationWithProducts,
} from './dto/create-quotation-with-products.dto';
import { plainToInstance } from 'class-transformer';
import { Quotation, QuotationDto } from '@shared/models';
import {
  QuotationTotalCountDto,
  QuotationWithAllDataDto,
} from './dto/quotation-with-all-data.dto';
import { QuotationsettingsService } from '@/quotationsettings/quotationsettings.service';
import {
  formatCompanyAddress,
  formatCustomerBillingAddress,
  formatCustomerShippingAddress,
} from '@shared/utils/formatAddress';
import { InvoiceService } from '@/invoice/invoice.service';
import { InvoicesettingsService } from '@/invoicesettings/invoicesettings.service';
import { InvoicetemplateService } from '@/invoicetemplate/invoicetemplate.service';
import { SharedService } from '@/shared/shared.service';
import { ENHANCED_PRISMA } from '@zenstackhq/server/nestjs';

@Injectable()
export class QuotationService {
  constructor(
    private prismaService: PrismaService,
    @Inject(ENHANCED_PRISMA) private quotationSetting: QuotationsettingsService,
    private invoiceService: InvoiceService,
    private invoiceSettingService: InvoicesettingsService,
    private invoiceTemplateService: InvoicetemplateService,
    private sharedService: SharedService,
  ) {}

  async create(createQuotationDto: CreateQuotationWithProducts) {
    await this.sharedService.checkQuotationQuota(createQuotationDto.user_id);
    if (createQuotationDto?.product?.length === 0) {
      throw new BadRequestException('Products are missing');
    }
    const checkQuotationNumberExists =
      await this.prismaService.quotation.findFirst({
        where: {
          quatation_number: createQuotationDto.quatation_number,
          user_id: createQuotationDto.user_id,
        },
      });
    if (checkQuotationNumberExists) {
      throw new BadRequestException(
        'Quotation number already exists, please use a different one',
      );
    }
    const { product, ...rest } = createQuotationDto;
    const quotationDetails = await this.prismaService.quotation.create({
      data: {
        ...rest,
        quatation_number: createQuotationDto.quatation_number,
        tax_id: createQuotationDto.tax_id ? createQuotationDto.tax_id : null,
        // product: {
        //   createMany: {
        //     data: createQuotationDto.product.map((product) => {
        //       return {
        //         product_id: product.product_id,
        //         quantity: product.quantity,
        //         hsnCode_id: product.hsnCode_id,
        //         price: product.price,
        //         total: product.total,
        //       };
        //     }),
        //   },
        // },
      },
    });

    await Promise.all(
      product.map(async (product) => {
        await this.prismaService.quotationProducts.create({
          data: {
            product_id: product.product_id,
            quantity: product.quantity,
            hsnCode_id: product.hsnCode_id,
            price: product.price,
            total: product.total,
            quotation_id: quotationDetails.id,
            tax_forQuotationProducts: {
              createMany: {
                data: product.taxes.map((tax) => ({
                  tax_id: tax,
                })),
              },
            },
          },
        });
      }),
    );

    return plainToInstance(QuotationDto, quotationDetails);
  }

  async findAll(user_id: string) {
    const invoices = await this.prismaService.quotation.findMany({
      where: { user_id },
      include: {
        customer: true,
      },
    });
    return plainToInstance(Quotation, invoices);
  }

  async findOne(id: string) {
    const invoice = await this.prismaService.quotation.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            tax_forQuotationProducts: {
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
    return plainToInstance(QuotationWithAllDataDto, invoice);
  }

  async update(id: string, updateQuotationDto: UpdateQuotationWithProducts) {
    const { product, ...rest } = updateQuotationDto;
    const invoice = await this.prismaService.quotation.update({
      where: { id },
      data: {
        ...rest,
        quatation_number: updateQuotationDto.quatation_number,
        tax_id: updateQuotationDto.tax_id ? updateQuotationDto.tax_id : null,
        // product: {
        //   deleteMany: {},
        //   createMany: {
        //     data: updateQuotationDto.product.map((product) => {
        //       return {
        //         product_id: product.product_id,
        //         quantity: product.quantity,
        //         hsnCode_id: product.hsnCode_id,
        //         price: product.price,
        //         total: product.total,
        //       };
        //     }),
        //   },
        // },
      },
    });
    await this.prismaService.quotationProducts.deleteMany({
      where: { quotation_id: id },
    });
    await Promise.all(
      product.map(async (product) => {
        await this.prismaService.quotationProducts.create({
          data: {
            product_id: product.product_id,
            quantity: product.quantity,
            hsnCode_id: product.hsnCode_id,
            price: product.price,
            total: product.total,
            quotation_id: invoice.id,
            tax_forQuotationProducts: {
              createMany: {
                data: product.taxes.map((tax) => ({
                  tax_id: tax,
                })),
              },
            },
          },
        });
      }),
    );
    return plainToInstance(QuotationDto, invoice);
  }

  async remove(id: string) {
    const quotation = await this.prismaService.quotation.delete({
      where: { id },
    });
    return plainToInstance(QuotationDto, quotation);
  }

  async findQuotationTest(id: string) {
    const quotation = await this.prismaService.quotation.findUnique({
      where: { id },
      include: {
        currency: true,
        tax: true,
        template: true,
        product: {
          include: {
            tax_forQuotationProducts: {
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
    const mapNew = {
      ...quotation,
      product: [
        ...quotation.product.map((item) => ({
          ...item,
          product: {
            ...item.product,
            tax: {
              percentage:
                item?.tax_forQuotationProducts?.reduce(
                  (acc, tax) => acc + tax.tax.percentage,
                  0,
                ) || 0,
            },
            currency: {
              ...quotation.currency,
            },
          },
        })),
      ],
    };
    return plainToInstance(QuotationWithAllDataDto, mapNew);
  }

  async quotationSettingsWithFormat(quotation: QuotationWithAllDataDto) {
    const a = quotation;
    const quotationSettings =
      await this.prismaService.quotationSettings.findFirst({
        where: { user_id: a?.user?.id },
      });
    if (quotationSettings === null || a?.user?.id === null) {
      a.companyAddress = '';
      a.customerBillingAddress = '';
      a.customerShippingAddress = '';
    } else {
      const companyAddress = formatCompanyAddress(
        a,
        quotationSettings?.companyAddressTemplate,
      );
      a.companyAddress = companyAddress === '<p><br></p>' ? '' : companyAddress;
      const customerBillingAddress = formatCustomerBillingAddress(
        a,
        quotationSettings?.customerBillingAddressTemplate,
      );
      a.customerBillingAddress =
        customerBillingAddress === '<p><br></p>' ? '' : customerBillingAddress;
      const customerShippingAddress = formatCustomerShippingAddress(
        a,
        quotationSettings?.customerShippingAddressTemplate,
      );
      a.customerShippingAddress =
        customerShippingAddress === '<p><br></p>'
          ? ''
          : customerShippingAddress;
    }
    return {
      quotation: a,
      quotationSettings,
    };
  }

  async statusToMailed(id: string) {
    const invoice = await this.prismaService.quotation.update({
      where: { id },
      data: {
        status: 'Mailed to customer',
      },
    });
    return plainToInstance(QuotationDto, invoice);
  }

  async statusToAccepted(id: string) {
    const invoice = await this.prismaService.quotation.update({
      where: { id },
      data: {
        status: 'Accepted',
      },
    });
    return plainToInstance(QuotationDto, invoice);
  }

  async statusToRejected(id: string) {
    const invoice = await this.prismaService.quotation.update({
      where: { id },
      data: {
        status: 'Rejected',
      },
    });
    return plainToInstance(QuotationDto, invoice);
  }

  async convertToInvoice(id: string) {
    const quotation = await this.prismaService.quotation.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            tax_forQuotationProducts: true,
          },
        },
      },
    });
    const invoiceSettings = await this.invoiceSettingService.findFirst(
      quotation?.user_id,
    );

    const invoiceTemplates = await this.invoiceTemplateService?.findAll();
    const invoice = await this.invoiceService.create({
      invoice_number: quotation.quatation_number,
      customer_id: quotation.customer_id,
      date: quotation.date,
      due_date: quotation.expiry_at,
      is_recurring: false,
      status: 'Draft',
      product: quotation?.product?.map((product) => {
        return {
          product_id: product.product_id,
          quantity: product.quantity,
          hsnCode_id: product.hsnCode_id,
          price: product.price,
          total: product.total,
          taxes: product.tax_forQuotationProducts.map((tax) => tax.tax_id),
        };
      }),
      sub_total: quotation.sub_total,
      total: quotation.total,
      user_id: quotation.user_id,
      tax_id: quotation.tax_id,
      discountPercentage: quotation.discountPercentage,
      notes: quotation.notes,
      reference_number: quotation.reference_number,
      due_amount: quotation.total,
      paid_amount: 0,
      template_id:
        invoiceSettings?.invoiceTemplateId ??
        invoiceTemplates?.find((item) => item?.view === 'template1')?.id,
    });
    await this.remove(id);
    return plainToInstance(QuotationDto, invoice);
  }

  async createQuotationPreview(
    createQuotationDto: CreateQuotationWithProducts,
  ) {
    const quotationDetails: any = {
      ...createQuotationDto,
    };
    if (createQuotationDto.tax_id) {
      quotationDetails.tax = await this.prismaService.tax.findUnique({
        where: { id: createQuotationDto.tax_id },
      });
    }
    if (createQuotationDto?.product?.length > 0) {
      quotationDetails.product = await Promise.all(
        createQuotationDto.product.map(async (product) => {
          const taxDetails = await this.prismaService.tax.findMany({
            where: {
              id: {
                in: product.taxes,
              },
            },
          });
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
          const currency = await this.prismaService.currencies.findUnique({
            where: { id: quotationDetails?.currency_id },
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
            currency: {
              ...currency,
            },
          };
        }),
      );
    }
    if (createQuotationDto?.customer_id) {
      quotationDetails.customer = await this.prismaService.customer.findUnique({
        where: { id: createQuotationDto.customer_id },
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
    if (createQuotationDto?.user_id) {
      quotationDetails.user = await this.prismaService.user.findUnique({
        where: { id: createQuotationDto.user_id },
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
    if (createQuotationDto?.template_id) {
      quotationDetails.template =
        await this.prismaService.quotationTemplate.findUnique({
          where: { id: createQuotationDto.template_id },
        });
    }
    return quotationDetails;
  }

  async countTotal(user_id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: user_id },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const total = await this.prismaService.quotation.count({
      where: { user_id: user?.isAdmin ? undefined : user_id },
    });
    return plainToInstance(QuotationTotalCountDto, { total });
  }

  async findAllByUserAutoConvert(id: string) {
    const users = await this.prismaService.user.findMany({
      where: {
        QuotationSettings: {
          some: {
            autoConvert: true,
          },
        },
      },
      include: {
        quotation: {
          where: {
            id: id,
          },
        },
      },
    });

    for (const user of users) {
      for (const quotation of user.quotation)
        if (quotation) {
          await this.convertToInvoice(id);
        }
    }
  }
}
