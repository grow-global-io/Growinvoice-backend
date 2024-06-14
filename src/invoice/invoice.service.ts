import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { InvoiceDto, UpdateInvoiceDto } from '@shared/models';
import { plainToInstance } from 'class-transformer';
import { CreateInvoiceWithProducts } from './dto/create-invoice-with-products.dto';

@Injectable()
export class InvoiceService {
  constructor(private prismaService: PrismaService) {}
  async create(createInvoiceDto: CreateInvoiceWithProducts) {
    const invoiceDetails = await this.prismaService.invoice.create({
      data: {
        ...createInvoiceDto,
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

  async findAll() {
    const invoices = await this.prismaService.invoice.findMany({
      include: {
        product: true,
      },
    });
    return plainToInstance(InvoiceDto, invoices);
  }

  async findOne(id: string) {
    const invoice = await this.prismaService.invoice.findUnique({
      where: { id },
    });
    return plainToInstance(InvoiceDto, invoice);
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceDto) {
    const invoice = await this.prismaService.invoice.update({
      where: { id },
      data: updateInvoiceDto,
    });
    return plainToInstance(InvoiceDto, invoice);
  }

  async remove(id: string) {
    const invoice = await this.prismaService.invoice.delete({
      where: { id },
    });
    return plainToInstance(InvoiceDto, invoice);
  }
}
