import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  CreateInvoiceTemplateDto,
  InvoiceTemplateDto,
  UpdateInvoiceTemplateDto,
} from '@shared/models';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class InvoicetemplateService {
  constructor(private prismaService: PrismaService) {}
  async create(createInvoicetemplateDto: CreateInvoiceTemplateDto) {
    const invoiceTemplate = await this.prismaService.invoiceTemplate.create({
      data: createInvoicetemplateDto,
    });
    return plainToInstance(InvoiceTemplateDto, invoiceTemplate);
  }

  async findAll() {
    const invoiceTemplates =
      await this.prismaService.invoiceTemplate.findMany();
    return invoiceTemplates.map((invoiceTemplate) =>
      plainToInstance(InvoiceTemplateDto, invoiceTemplate),
    );
  }

  async findOne(id: string) {
    const invoiceTemplate = await this.prismaService.invoiceTemplate.findUnique(
      {
        where: {
          id,
        },
      },
    );
    return plainToInstance(InvoiceTemplateDto, invoiceTemplate);
  }

  async update(id: string, updateInvoicetemplateDto: UpdateInvoiceTemplateDto) {
    const invoiceTemplate = await this.prismaService.invoiceTemplate.update({
      where: {
        id,
      },
      data: updateInvoicetemplateDto,
    });
    return plainToInstance(InvoiceTemplateDto, invoiceTemplate);
  }

  async remove(id: string) {
    await this.prismaService.invoiceTemplate.delete({
      where: {
        id,
      },
    });
    return {
      message: 'Invoice template deleted successfully',
    };
  }
}
