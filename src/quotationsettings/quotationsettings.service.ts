import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  CreateQuotationSettingsDto,
  QuotationSettingsDto,
  UpdateQuotationSettingsDto,
} from '@shared/models';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class QuotationsettingsService {
  constructor(private prismaService: PrismaService) {}
  async create(createQuotationsettingDto: CreateQuotationSettingsDto) {
    const quotationsetting = await this.prismaService.quotationSettings.create({
      data: createQuotationsettingDto,
    });
    return plainToInstance(QuotationSettingsDto, quotationsetting);
  }

  async findAll(user_id: string) {
    const quotationsettings =
      await this.prismaService.quotationSettings.findMany({
        where: { user_id },
      });
    return plainToInstance(QuotationSettingsDto, quotationsettings);
  }

  async findOne(id: string) {
    const quotationsetting =
      await this.prismaService.quotationSettings.findUnique({
        where: { id },
      });
    return plainToInstance(QuotationSettingsDto, quotationsetting);
  }

  async update(
    id: string,
    updateQuotationsettingDto: UpdateQuotationSettingsDto,
  ) {
    const quotationsetting = await this.prismaService.quotationSettings.update({
      where: { id },
      data: updateQuotationsettingDto,
    });
    return plainToInstance(QuotationSettingsDto, quotationsetting);
  }

  async remove(id: string) {
    await this.prismaService.quotationSettings.delete({ where: { id } });
    return {
      message: 'Quotation setting deleted successfully',
    };
  }

  async findFirst(user_id: string) {
    const quotationsetting =
      await this.prismaService.quotationSettings.findFirst({
        where: { user_id },
      });
    return plainToInstance(QuotationSettingsDto, quotationsetting);
  }
}
