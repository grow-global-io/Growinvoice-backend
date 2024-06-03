import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { CompanyDto, UpdateCompanyDto } from '@shared/models';

@Injectable()
export class CompanyService {
  constructor(private prismaService: PrismaService) {}

  findOne(id: string) {
    const company = this.prismaService.company.findUnique({
      where: { id },
    });
    return plainToInstance(CompanyDto, company);
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto) {
    const updateCompany = await this.prismaService.company.update({
      where: { id },
      data: updateCompanyDto,
    });

    return plainToInstance(CompanyDto, updateCompany);
  }

  async remove(id: string) {
    const company = await this.prismaService.company.delete({
      where: { id },
    });
    return plainToInstance(CompanyDto, company);
  }
}
