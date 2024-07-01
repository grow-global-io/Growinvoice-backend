import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  CreateQuotationTemplateDto,
  QuotationTemplateDto,
  UpdateQuotationTemplateDto,
} from '@shared/models';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class QuotationtemplateService {
  constructor(private prismaService: PrismaService) {}
  async create(createQuotationtemplateDto: CreateQuotationTemplateDto) {
    const quotation = await this.prismaService.quotationTemplate.create({
      data: createQuotationtemplateDto,
    });
    return plainToInstance(QuotationTemplateDto, quotation);
  }

  async findAll() {
    const quotations = await this.prismaService.quotationTemplate.findMany();
    return quotations.map((quotation) =>
      plainToInstance(QuotationTemplateDto, quotation),
    );
  }

  async findOne(id: string) {
    const quotation = await this.prismaService.quotationTemplate.findUnique({
      where: { id },
    });
    return plainToInstance(QuotationTemplateDto, quotation);
  }

  async update(
    id: string,
    updateQuotationtemplateDto: UpdateQuotationTemplateDto,
  ) {
    const quotation = await this.prismaService.quotationTemplate.update({
      where: { id },
      data: updateQuotationtemplateDto,
    });
    return plainToInstance(QuotationTemplateDto, quotation);
  }

  async remove(id: string) {
    await this.prismaService.quotationTemplate.delete({ where: { id } });
    return {
      message: 'Quotation template deleted successfully',
    };
  }
}
