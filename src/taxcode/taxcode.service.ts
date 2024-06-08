import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateTaxDto, TaxDto, UpdateTaxDto } from '@shared/models';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class TaxcodeService {
  constructor(private prismaService: PrismaService) {}
  create(createTaxcodeDto: CreateTaxDto) {
    const taxcode = this.prismaService.tax.create({
      data: createTaxcodeDto,
    });
    return plainToInstance(TaxDto, taxcode);
  }

  async findAll(user_id: string) {
    const taxcode = await this.prismaService.tax.findMany({
      where: { user_id },
    });
    return plainToInstance(TaxDto, taxcode);
  }

  findOne(id: string) {
    const taxcode = this.prismaService.tax.findUnique({
      where: { id },
    });
    return plainToInstance(TaxDto, taxcode);
  }

  update(id: string, updateTaxcodeDto: UpdateTaxDto) {
    const taxcode = this.prismaService.tax.update({
      where: { id },
      data: updateTaxcodeDto,
    });
    return plainToInstance(TaxDto, taxcode);
  }

  remove(id: string) {
    return this.prismaService.tax.delete({
      where: { id },
    });
  }
}
