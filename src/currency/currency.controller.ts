import { Controller, Get } from '@nestjs/common';
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
}
