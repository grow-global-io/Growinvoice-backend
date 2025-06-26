import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { StoreService } from './store.service';
import { ApiExtraModels, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UserWithProducts } from './dto/user-with-products.dto';
import { IsPublic } from '@shared/decorators/public.decorator';
import { CheckoutInvoiceCreateDto } from './dto/checkout-invoice.dto';

@Controller('store')
@ApiTags('Store')
@ApiExtraModels(UserWithProducts)
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @IsPublic()
  @Post('checkout')
  async createCheckoutInvoice(@Body() body: CheckoutInvoiceCreateDto) {
    return this.storeService.createCheckoutInvoice(body);
  }

  @IsPublic()
  @Get()
  @ApiQuery({
    name: 'userId',
    required: true,
    type: String,
    description: 'The ID of the user whose store is being queried',
  })
  @ApiQuery({
    name: 'currency',
    required: true,
    type: String,
    description: 'The currency code to filter products by currency',
  })
  async getStore(
    @Query('userId') userId: string,
    @Query('currency') currency: string,
  ) {
    return this.storeService.getStore(userId, currency);
  }

  @IsPublic()
  @Get('search')
  async searchProducts(
    @Query('query') query: string,
    @Query('currency') currency: string,
  ) {
    return this.storeService.searchProducts(query, currency);
  }
}
