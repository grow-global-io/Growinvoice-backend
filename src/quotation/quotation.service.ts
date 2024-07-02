import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CreateQuotationWithProducts,
  UpdateQuotationWithProducts,
} from './dto/create-quotation-with-products.dto';
import { plainToInstance } from 'class-transformer';
import { Quotation, QuotationDto } from '@shared/models';
import { QuotationWithAllDataDto } from './dto/quotation-with-all-data.dto';
import { QuotationsettingsService } from '@/quotationsettings/quotationsettings.service';
import {
  formatCompanyAddress,
  formatCustomerBillingAddress,
  formatCustomerShippingAddress,
} from '@shared/utils/formatAddress';

@Injectable()
export class QuotationService {
  constructor(
    private prismaService: PrismaService,
    private quotationSetting: QuotationsettingsService,
  ) {}

  async create(createQuotationDto: CreateQuotationWithProducts) {
    const quotationDetails = await this.prismaService.quotation.create({
      data: {
        ...createQuotationDto,
        quatation_number: createQuotationDto.quatation_number,
        tax_id: createQuotationDto.tax_id ? createQuotationDto.tax_id : null,
        product: {
          createMany: {
            data: createQuotationDto.product.map((product) => {
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
        product: true,
        customer: true,
      },
    });
    return plainToInstance(QuotationWithAllDataDto, invoice);
  }

  async update(id: string, updateQuotationDto: UpdateQuotationWithProducts) {
    const invoice = await this.prismaService.quotation.update({
      where: { id },
      data: {
        ...updateQuotationDto,
        quatation_number: updateQuotationDto.quatation_number,
        tax_id: updateQuotationDto.tax_id ? updateQuotationDto.tax_id : null,
        product: {
          deleteMany: {},
          createMany: {
            data: updateQuotationDto.product.map((product) => {
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
        tax: true,
        template: true,
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
    return plainToInstance(QuotationWithAllDataDto, quotation);
  }

  async quotationSettingsWithFormat(quotation: QuotationWithAllDataDto) {
    const a = quotation;
    const quotationSettings = await this.quotationSetting?.findOne(
      quotation?.user?.id,
    );
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
}
