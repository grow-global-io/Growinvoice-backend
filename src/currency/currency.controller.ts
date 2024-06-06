import { Controller, Get, Query } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('currency')
@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get()
  findAll() {
    return this.currencyService.findAll();
  }

  @Get('countries')
  findCountries() {
    return this.currencyService.findCountries();
  }

  @Get('states')
  findStates() {
    return this.currencyService.findStates();
  }

  @Get('statesByCountry')
  findStatesByCountry(@Query('countryId') countryId: string) {
    return this.currencyService.findStatesByCountry(countryId);
  }
}
