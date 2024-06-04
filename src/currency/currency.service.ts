import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CurrenciesDto } from '@shared/models';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CurrencyService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    const currencies = await this.prismaService.currencies.findMany();
    return plainToInstance(CurrenciesDto, currencies);
  }
}
