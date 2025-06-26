import { Controller, Get, Query } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { ApiTags } from '@nestjs/swagger';
import { IsPublic } from '@shared/decorators/public.decorator';

@ApiTags('currency')
@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @IsPublic()
  @Get()
  findAll() {
    return this.currencyService.findAll();
  }

  @IsPublic()
  @Get('countries')
  findCountries() {
    return this.currencyService.findCountries();
  }

  @IsPublic()
  @Get('states')
  findStates() {
    return this.currencyService.findStates();
  }

  @IsPublic()
  @Get('statesByCountry')
  findStatesByCountry(@Query('countryId') countryId: string) {
    return this.currencyService.findStatesByCountry(countryId);
  }
}
