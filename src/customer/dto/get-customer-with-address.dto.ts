import {
  BillingAddressDto,
  CustomerDto,
  ShippingAddressDto,
} from '@shared/models';
import { Type } from 'class-transformer';

export class GetCustomerWithAddressDto extends CustomerDto {
  @Type(() => BillingAddressDto)
  billingAddress?: BillingAddressDto;

  @Type(() => ShippingAddressDto)
  shippingAddress?: ShippingAddressDto;
}
