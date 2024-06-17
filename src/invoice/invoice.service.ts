import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Invoice, InvoiceDto } from '@shared/models';
import { plainToInstance } from 'class-transformer';
import {
  CreateInvoiceWithProducts,
  UpdateInvoiceWithProducts,
} from './dto/create-invoice-with-products.dto';
import { InvoiceWithAllDataDto } from './dto/invoice-with-all-data.dto';

@Injectable()
export class InvoiceService {
  constructor(private prismaService: PrismaService) {}
  async create(createInvoiceDto: CreateInvoiceWithProducts) {
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
        product: {
          include: {
            product: true,
          },
        },
        customer: true,
      },
    });
    console.log(invoice.product[0]?.product);
    return plainToInstance(InvoiceWithAllDataDto, invoice);
  }
}
