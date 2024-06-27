import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  CreateInvoiceSettingsDto,
  InvoiceSettingsDto,
  UpdateInvoiceSettingsDto,
} from '@shared/models';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class InvoicesettingsService {
  constructor(private prismaService: PrismaService) {}

  async create(createInvoicesettingDto: CreateInvoiceSettingsDto) {
    const setting = await this.prismaService.invoiceSettings.create({
      data: createInvoicesettingDto,
    });
    return plainToInstance(InvoiceSettingsDto, setting);
  }

  async findAll(user_id: string) {
    const settings = await this.prismaService.invoiceSettings.findMany({
      where: {
        user_id,
      },
    });
    return plainToInstance(InvoiceSettingsDto, settings);
  }

  async findFirst(user_id: string) {
    const setting = await this.prismaService.invoiceSettings.findFirst({
      where: {
        user_id,
      },
    });
    return plainToInstance(InvoiceSettingsDto, setting);
  }

  async findOne(id: string) {
    const setting = await this.prismaService.invoiceSettings.findUnique({
      where: {
        id,
      },
    });
    return plainToInstance(InvoiceSettingsDto, setting);
  }

  async update(id: string, updateInvoicesettingDto: UpdateInvoiceSettingsDto) {
    const setting = await this.prismaService.invoiceSettings.update({
      where: {
        id,
      },
      data: updateInvoicesettingDto,
    });
    return plainToInstance(InvoiceSettingsDto, setting);
  }

  async remove(id: string) {
    return this.prismaService.invoiceSettings.delete({
      where: {
        id,
      },
    });
  }
}
