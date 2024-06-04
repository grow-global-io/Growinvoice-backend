import { Controller, Get } from '@nestjs/common';
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
}
