import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CountryDto, CurrenciesDto, StateDto } from '@shared/models';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CurrencyService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    const currencies = await this.prismaService.currencies.findMany();
    return plainToInstance(CurrenciesDto, currencies);
  }

  async findCountries() {
    const countries = await this.prismaService.country.findMany();
    return plainToInstance(CountryDto, countries);
  }

  async findStates() {
    const states = await this.prismaService.state.findMany();
    return plainToInstance(StateDto, states);
  }

  async findStatesByCountry(countryId: string) {
    const states = await this.prismaService.state.findMany({
      where: {
        country_id: countryId,
      },
    });
    return plainToInstance(StateDto, states);
  }
}
