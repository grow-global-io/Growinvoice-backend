import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CreateQuotationWithProducts,
  UpdateQuotationWithProducts,
} from './dto/create-quotation-with-products.dto';
import { plainToInstance } from 'class-transformer';
import { Quotation, QuotationDto } from '@shared/models';
import { QuotationWithAllDataDto } from './dto/quotation-with-all-data.dto';

@Injectable()
export class QuotationService {
  constructor(private prismaService: PrismaService) {}

  async create(createQuotationDto: CreateQuotationWithProducts) {
    const quotationDetails = await this.prismaService.quotation.create({
      data: {
        ...createQuotationDto,
        quatation_number: createQuotationDto.quatation_number,
        tax_id: createQuotationDto.tax_id ? createQuotationDto.tax_id : null,
        quotation: {
          createMany: {
            data: createQuotationDto.quotation.map((product) => {
              return {
                product_id: product.product_id,
                quantity: product.quantity,
                tax: product.tax,
                hsnCode: product.hsnCode,
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
        quotation: true,
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
        quotation: {
          deleteMany: {},
          createMany: {
            data: updateQuotationDto.quotation.map((product) => {
              return {
                product_id: product.product_id,
                quantity: product.quantity,
                tax: product.tax,
                hsnCode: product.hsnCode,
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
}
