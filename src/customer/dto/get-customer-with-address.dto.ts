import { ApiProperty } from '@nestjs/swagger';
import {
  BillingAddressDto,
  CustomerDto,
  ShippingAddressDto,
} from '@shared/models';
import { Type } from 'class-transformer';

export class CountInvoiceDto {
  @ApiProperty({
    type: 'number',
    required: false,
  })
  invoice?: number;
}

export class CountTotalDueDto {
  @ApiProperty({
    type: 'number',
    required: false,
  })
  totalDue?: number;
}

export class GetCustomerWithAddressDto extends CustomerDto {
  @Type(() => BillingAddressDto)
  billingAddress?: BillingAddressDto;

  @Type(() => ShippingAddressDto)
  shippingAddress?: ShippingAddressDto;

  @Type(() => CountInvoiceDto)
  _count?: CountInvoiceDto;

  @Type(() => CountTotalDueDto)
  totalDue?: CountTotalDueDto;
}
